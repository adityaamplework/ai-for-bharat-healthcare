from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from ai_services.models.schemas import ChatRequest, ChatResponse
import logging

logger = logging.getLogger("ai_services")

SYSTEM_PROMPT = """You are a knowledgeable and empathetic Ayurvedic health assistant named AyurDiet AI.
Your purpose is to help users understand Ayurvedic principles, diet, and lifestyle recommendations.
Answer questions based on traditional Ayurvedic knowledge (Doshas: Vata, Pitta, Kapha), dietary guidelines, and holistic wellness.
Be concise, polite, and practical. Do not provide medical diagnoses or prescribe medications. Always advise consulting a qualified Ayurvedic practitioner or doctor for serious medical conditions.
Address the user conversationally and provide actionable advice when appropriate.
"""


def chat_graph(request: ChatRequest) -> ChatResponse:
    """Simple conversational chain using LangChain with chat history."""
    try:
        logger.info(
            f"Processing chat request with {len(request.history)} history messages.")
        llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)

        # Build message history
        messages = [SystemMessage(content=SYSTEM_PROMPT)]

        for msg in request.history:
            if msg.role == "user":
                messages.append(HumanMessage(content=msg.content))
            elif msg.role in ["assistant", "ai"]:
                messages.append(AIMessage(content=msg.content))

        # Append the current message
        messages.append(HumanMessage(content=request.message))

        # Call LLM
        response = llm.invoke(messages)

        return ChatResponse(response=response.content)
    except Exception as e:
        logger.error(f"Error in chat_graph: {str(e)}")
        raise e
