from PyInstaller.utils.hooks import collect_submodules
from pathlib import Path
R=Path(__file__).resolve().parent.parent
a=Analysis([str(R/'desktop'/'launcher.py')],pathex=[str(R)],datas=[(str(R/'frontend'),'frontend'),(str(R/'data'),'data'),(str(R/'models'),'models')],hiddenimports=collect_submodules('uvicorn')+['backend.main','backend.ai','backend.db'])
pyz=PYZ(a.pure)
exe=EXE(pyz,a.scripts,[],exclude_binaries=True,name='DateALiveAI',console=True)
COLLECT(exe,a.binaries,a.datas,a.zipfiles,name='DateALiveAI')
