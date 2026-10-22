from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from pathlib import Path
import json, random, platform, psutil, subprocess, tempfile, uuid, copy
from .db import init, chats, chat, new, add, delete_chat, save_battle, saved_battles, get_saved_battle, delete_saved_battle
from .ai import ask

BASE = Path(__file__).resolve().parent.parent
MEDIA = BASE / "models"
VOICE_DIR = MEDIA / "voices"
init()
app = FastAPI(title="Date A Live AI Local")
CH = json.loads((BASE / "data/characters/characters.json").read_text(encoding="utf-8"))

class ChatIn(BaseModel): character_id: str; title: str = "Nueva conversación"
class MsgIn(BaseModel): chat_id: int; content: str
class TTSIn(BaseModel): character_id: str; text: str
class BattleNewIn(BaseModel): team_a: list[str] = Field(min_length=1, max_length=4); team_b: list[str] = Field(min_length=1, max_length=4)
class BattleActionIn(BaseModel): state: dict; actor_team: str; actor_id: str; action: str; target_id: str | None = None
class BattleSaveIn(BaseModel): state: dict

def get_character(cid): return next((z for z in CH if z["id"] == cid), None)
def validate_team(team):
    if not team or len(team)>4 or len(set(team)) != len(team): raise HTTPException(400,"Equipo inválido")
    if any(not get_character(x) for x in team): raise HTTPException(400,"Espíritu inválida")

def fresh_unit(cid):
    c=get_character(cid); s=copy.deepcopy(c["stats"])
    s["max_hp"]=s["hp"]; s["hp"]=s["max_hp"]; s["defense_bonus"]=0; s["angel_used"]=False; total=s["hp"]+s["attack"]*4+s["defense"]*4+s["speed"]*3; s["rank"]="S" if total>=260 else "A" if total>=220 else "B" if total>=185 else "C"
    return {"id":cid,"name":c["name"],"image":c["image"],"title":c["title"],"description":c["description"],"stats":s}

def battle_state(team_a,team_b):
    return {"team_a":[fresh_unit(x) for x in team_a],"team_b":[fresh_unit(x) for x in team_b],"turn":1,"current_team":"a","active_fighter":team_a[0] if team_a else None,"active_target":team_b[0] if team_b else None,"score":{"a":0,"b":0},"log":["La batalla comienza. Elegí una acción para tu equipo."] ,"winner":None,"finished":False}

def living(team): return [u for u in team if u["stats"]["hp"]>0]
def find_unit(state,cid):
    for t in (state["team_a"],state["team_b"]):
        for u in t:
            if u["id"]==cid:return u
    return None

def attack(attacker,target,angel=False):
    a=attacker["stats"]; d=target["stats"]
    raw=a["attack"]+random.randint(-2,5)+(8 if angel else 0)
    dmg=max(1,raw-max(0,d["defense"]+d.get("defense_bonus",0))//3)
    if angel: dmg=int(dmg*1.55)
    d["hp"]=max(0,d["hp"]-dmg)
    return dmg

def use_angel(unit,state,team):
    s=unit["stats"]
    if s.get("angel_used"): return "Ya utilizaste el Ángel de este Espíritu.",0
    s["angel_used"]=True; cid=unit["id"]
    if cid in {"tohka","kurumi","origami","mukuro"}:
        targets=living(state["team_b"] if team=="a" else state["team_a"])
        if not targets:return "No quedan rivales.",0
        total=0
        for t in targets: total += attack(unit,t,True)
        return f"{unit['name']} invoca su Ángel y desata un ataque devastador.",total
    if cid in {"yoshino","rinne"}:
        healed=0
        for u in state[f"team_{team}"]:
            if u["stats"]["hp"]>0:
                old=u["stats"]["hp"]; u["stats"]["hp"]=min(u["stats"]["max_hp"],old+28); healed+=u["stats"]["hp"]-old
        return f"{unit['name']} usa su Ángel para restaurar al equipo.",healed
    if cid in {"kotori","natsumi"}:
        for u in living(state[f"team_{team}"]): u["stats"]["defense_bonus"] += 8
        return f"{unit['name']} refuerza la defensa de todo el equipo.",8
    if cid=="miku":
        for u in living(state[f"team_{team}"]): u["stats"]["attack"] += 5
        return f"{unit['name']} potencia el ataque del equipo con su Ángel.",5
    if cid=="nia":
        for u in living(state[f"team_{team}"]): u["stats"]["speed"] += 5
        return f"{unit['name']} altera el ritmo del combate y aumenta la velocidad.",5
    for u in living(state[f"team_{team}"]): u["stats"]["defense_bonus"] += 6
    return f"{unit['name']} activa un efecto protector especial.",6

def enemy_turn(state):
    enemy_team="b"; target_team="a"
    enemies=living(state[f"team_{enemy_team}"]); targets=living(state[f"team_{target_team}"])
    for enemy in enemies:
        if not targets: break
        target=random.choice(targets); dmg=attack(enemy,target)
        state["log"].append(f"{enemy['name']} contraataca a {target['name']} y causa {dmg} de daño.")
        targets=living(state[f"team_{target_team}"])
    return state

def finish_if_needed(state):
    a,b=living(state["team_a"]),living(state["team_b"])
    if not a or not b:
        state["finished"]=True; state["winner"]="a" if a else "b"; state["score"][state["winner"]]+=100
        state["log"].append("¡VICTORIA!" if state["winner"]=="a" else "DERROTA")
        return True
    return False

@app.get("/")
def home(): return FileResponse(BASE/"frontend/index.html")
@app.get("/api/characters")
def characters(): return CH
@app.get("/api/chats")
def getchats(): return chats()
@app.post("/api/chats")
def postchat(x:ChatIn):
    if not get_character(x.character_id): raise HTTPException(400,"Personaje inválido")
    return {"id":new(x.character_id,x.title)}
@app.get("/api/chats/{i}")
def getchat(i:int):
    x=chat(i)
    if not x["chat"]: raise HTTPException(404,"Chat no encontrado")
    return x
@app.delete("/api/chats/{i}")
def remove_chat(i:int):
    if not delete_chat(i): raise HTTPException(404,"Chat no encontrado")
    return {"ok":True}
@app.post("/api/messages")
async def message(x:MsgIn):
    d=chat(x.chat_id)
    if not d["chat"]: raise HTTPException(404,"Chat no encontrado")
    add(x.chat_id,"user",x.content); t,e=await ask(d["chat"]["character_id"],d["messages"]+[{"role":"user","content":x.content}]); add(x.chat_id,"assistant",t,e)
    return {"content":t,"emotion":e}
@app.get("/api/system")
def system():
    r=round(psutil.virtual_memory().total/1024**3,1)
    return {"os":platform.platform(),"cpu":platform.processor() or platform.machine(),"ram_gb":r,"recommended_model_size":"1B–3B" if r<8 else "3B–7B" if r<16 else "7B–14B" if r<32 else "14B+"}
@app.get("/api/offline")
def offline(): return {"offline_ready":True,"bind":"127.0.0.1","remote_apis":False}
def _piper_paths():
    candidates = [
        BASE/"runtime"/"piper"/"piper.exe",
        BASE/"piper"/"piper.exe",
        BASE/".venv"/"Scripts"/"piper.exe",
    ]
    piper = next((p for p in candidates if p.exists()), None)
    model = VOICE_DIR/"es_MX-ald-medium.onnx"
    return piper, model

@app.get("/api/tts/status")
def tts_status():
    piper, model = _piper_paths()
    ready = bool(piper and model.exists())
    voices = {c["id"]: ready for c in CH}
    return {"piper": bool(piper), "voices": voices, "model": model.name if model.exists() else None}

@app.post("/api/tts")
def tts(x:TTSIn):
    c=get_character(x.character_id); text=x.text.strip()
    if not c: raise HTTPException(400,"Personaje inválido")
    if not text: raise HTTPException(400,"Texto vacío")
    piper, model = _piper_paths()
    if not piper or not model:
        raise HTTPException(404,"Piper todavía no está instalado/configurado. Ejecutá INSTALAR.bat.")
    out=Path(tempfile.gettempdir())/f"dal_tts_{uuid.uuid4().hex}.wav"
    try:
        subprocess.run([str(piper),"--model",str(model),"--output_file",str(out)],
                       input=text.encode("utf-8"),stdout=subprocess.PIPE,
                       stderr=subprocess.PIPE,check=True,timeout=90,cwd=str(piper.parent))
        return FileResponse(out,media_type="audio/wav",filename="character_voice.wav")
    except subprocess.CalledProcessError as e:
        raise HTTPException(500,f"Piper no pudo generar la voz: {e.stderr.decode(errors='ignore')[-500:]}")
    except subprocess.TimeoutExpired:
        raise HTTPException(504,"La síntesis de voz tardó demasiado")

@app.post("/api/battles/new")
def new_battle(x:BattleNewIn):
    validate_team(x.team_a); validate_team(x.team_b)
    return battle_state(x.team_a,x.team_b)

@app.post("/api/battles/action")
def battle_action(x:BattleActionIn):
    state=copy.deepcopy(x.state)
    if state.get("finished"): return state
    team=x.actor_team
    if team not in ("a","b"): raise HTTPException(400,"Equipo inválido")
    unit=find_unit(state,x.actor_id)
    if not unit or unit["stats"]["hp"]<=0: raise HTTPException(400,"Combatiente inválido")
    if x.action=="attack":
        target=find_unit(state,x.target_id or "")
        if not target or target["stats"]["hp"]<=0: raise HTTPException(400,"Objetivo inválido")
        dmg=attack(unit,target); state["log"].append(f"{unit['name']} ataca a {target['name']} (-{dmg} HP)")
    elif x.action=="angel":
        msg,val=use_angel(unit,state,team); state["log"].append(msg)
    elif x.action=="defend":
        unit["stats"]["defense_bonus"]+=12; state["log"].append(f"{unit['name']} adopta una postura defensiva (+12 DEF).")
    else: raise HTTPException(400,"Acción inválida")
    if finish_if_needed(state): return state
    state["current_team"]="b" if team=="a" else "a"; state["turn"]+=1
    state=enemy_turn(state) if team=="a" else state
    finish_if_needed(state)
    if not state.get("finished"): state["current_team"]="a"
    return state

@app.post("/api/battles")
def battle(x:BattleNewIn): validate_team(x.team_a); validate_team(x.team_b); return battle_state(x.team_a,x.team_b)
@app.get("/api/battles/saved")
def list_saved():
    out=[]
    for r in saved_battles():
        try:
            s=json.loads(r["state_json"]); out.append({"id":r["id"],"created_at":r["created_at"],"updated_at":r["updated_at"],"turn":s.get("turn",1),"team_a":[u["name"] for u in s.get("team_a",[])],"team_b":[u["name"] for u in s.get("team_b",[])],"finished":s.get("finished",False)})
        except Exception: pass
    return out
@app.post("/api/battles/saved")
def save(x:BattleSaveIn): return {"id":save_battle(json.dumps(x.state,ensure_ascii=False))}
@app.get("/api/battles/saved/{i}")
def get_saved(i:int):
    r=get_saved_battle(i)
    if not r: raise HTTPException(404,"Batalla guardada no encontrada")
    return json.loads(r["state_json"])
@app.delete("/api/battles/saved/{i}")
def remove_saved(i:int):
    if not delete_saved_battle(i): raise HTTPException(404,"Batalla guardada no encontrada")
    return {"ok":True}

app.mount("/static",StaticFiles(directory=BASE/"frontend"),name="static")
app.mount("/media",StaticFiles(directory=MEDIA),name="media")
