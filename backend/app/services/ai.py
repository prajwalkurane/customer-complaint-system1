from typing import TypedDict
from langgraph.graph import StateGraph, END
from app.core.config import settings
class AnalysisState(TypedDict): text:str; summary:str; risk:str; cause:str; capa:str
def classify_risk(state: AnalysisState):
    text=state["text"].lower(); critical=["injury","fatal","recall","fraud","fire","safety"]
    high=["outage","breach","legal","damaged","urgent"]
    risk="Critical" if any(x in text for x in critical) else "High" if any(x in text for x in high) else "Medium"
    return {"risk":risk}
def summarize(state: AnalysisState): return {"summary":state["text"][:500]}
def root_cause(state: AnalysisState): return {"cause":"Investigate process, product, and communication evidence."}
def recommend_capa(state: AnalysisState): return {"capa":"Assign an owner, contain impact, identify root cause, implement corrective action, and verify effectiveness."}
def groq_enrich(state: AnalysisState):
    if not settings.groq_api_key: return {}
    try:
        from langchain_groq import ChatGroq
        llm=ChatGroq(api_key=settings.groq_api_key, model=settings.groq_model, temperature=0)
        prompt="Analyze complaint. Return exactly 4 lines beginning SUMMARY:, RISK (Low/Medium/High/Critical):, ROOT_CAUSE:, CAPA:.\n"+state["text"][:8000]
        lines=llm.invoke(prompt).content.splitlines(); data={}
        for line in lines:
            if ":" in line: k,v=line.split(":",1); data[k.strip().upper()]=v.strip()
        return {"summary":data.get("SUMMARY",state["text"][:500]),"risk":data.get("RISK (LOW/MEDIUM/HIGH/CRITICAL)",data.get("RISK","Medium")).title(),"cause":data.get("ROOT_CAUSE","AI response incomplete; investigate evidence."),"capa":data.get("CAPA","Assign owner and verify corrective action.")}
    except Exception: return {}
def analyze(text:str):
    graph=StateGraph(AnalysisState)
    graph.add_node("summarize_node",summarize);graph.add_node("risk_node",classify_risk);graph.add_node("root_cause_node",root_cause);graph.add_node("capa_node",recommend_capa);graph.add_node("groq_node",groq_enrich)
    graph.set_entry_point("summarize_node");graph.add_edge("summarize_node","risk_node");graph.add_edge("risk_node","root_cause_node");graph.add_edge("root_cause_node","capa_node");graph.add_edge("capa_node","groq_node");graph.add_edge("groq_node",END)
    return graph.compile().invoke({"text":text,"summary":"","risk":"","cause":"","capa":""})
