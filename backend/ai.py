import os,json,re,httpx
from pathlib import Path
from dotenv import load_dotenv
from fastapi import HTTPException

load_dotenv(Path(__file__).resolve().parent.parent / ".env")
C={x["id"]:x for x in json.loads((Path(__file__).resolve().parent.parent/"data/characters/characters.json").read_text(encoding="utf-8"))}
OLLAMA_BASE=os.getenv("OLLAMA_URL","http://127.0.0.1:11434").rstrip("/")
DEFAULT_MODEL=os.getenv("OLLAMA_MODEL","llama3.2:1b")

def _clean(value):
    if value is None:
        return ""
    if isinstance(value, (list, tuple, set)):
        return " ".join(_clean(v) for v in value)
    if isinstance(value, dict):
        return value.get("content") or json.dumps(value, ensure_ascii=False)
    return str(value)

async def _available_models(client):
    try:
        r=await client.get(OLLAMA_BASE+"/api/tags")
        r.raise_for_status()
        data=r.json()
        return [m.get("name") or m.get("model") for m in data.get("models",[]) if m.get("name") or m.get("model")]
    except Exception:
        return []

async def _choose_model(client):
    models=await _available_models(client)
    if DEFAULT_MODEL in models:
        return DEFAULT_MODEL
    if models:
        return models[0]
    return DEFAULT_MODEL

async def ask(cid,h):
    p=C.get(cid)
    if not p:
        raise HTTPException(400,"Personaje inválido")

    system=f"""Eres {p['name']}, personaje ficticio. Título: {p['title']}.
Personalidad: {p['personality']}. Responde siempre en español y mantén continuidad.
No afirmes ser una persona real ni un actor. Termina con una etiqueta:
[EMOTION:neutral], [EMOTION:happy], [EMOTION:angry], [EMOTION:sad], [EMOTION:surprised] o [EMOTION:shy]."""

    msgs=[{"role":"system","content":system}]
    for x in (h or [])[-16:]:
        role=_clean(x.get("role","user") if isinstance(x,dict) else "user")
        content=_clean(x.get("content","") if isinstance(x,dict) else x)
        if role not in {"system","user","assistant"}:
            role="user"
        if content:
            msgs.append({"role":role,"content":content})

    payload_base={"messages":msgs,"stream":False}

    async with httpx.AsyncClient(timeout=180) as q:
        model=await _choose_model(q)
        payload={"model":model,**payload_base}
        try:
            r=await q.post(OLLAMA_BASE+"/api/chat",json=payload)
        except httpx.RequestError as e:
            raise HTTPException(503,f"No se pudo conectar con Ollama en {OLLAMA_BASE}: {e}") from e

        if r.status_code == 404:
            # Some local Ollama setups expose the model through generate even
            # when chat is unavailable. Keep the app usable locally.
            prompt="\n".join(
                f"{m['role'].upper()}: {m['content']}" for m in msgs
            ) + "\nASSISTANT:"
            try:
                r2=await q.post(
                    OLLAMA_BASE+"/api/generate",
                    json={"model":model,"prompt":prompt,"stream":False}
                )
            except httpx.RequestError as e:
                raise HTTPException(503,f"Ollama no responde: {e}") from e
            if r2.status_code >= 400:
                detail=f"Ollama rechazó el modelo '{model}'. Modelos disponibles: {', '.join(await _available_models(q)) or 'ninguno'}"
                raise HTTPException(503,detail)
            data=r2.json()
            t=_clean(data.get("response",""))
        elif r.status_code >= 400:
            detail=f"Ollama devolvió HTTP {r.status_code}"
            try:
                err=r.json()
                detail += f": {err.get('error','')}"
            except Exception:
                pass
            raise HTTPException(503,detail)
        else:
            data=r.json()
            t=_clean((data.get("message") or {}).get("content",""))

    if not t:
        raise HTTPException(502,"Ollama no generó una respuesta.")

    m=re.search(r"\[EMOTION:(\w+)\]",t,re.I)
    e=m.group(1).lower() if m else "neutral"
    t=re.sub(r"\s*\[EMOTION:\w+\]\s*$","",t,flags=re.I).strip()
    return t,e
