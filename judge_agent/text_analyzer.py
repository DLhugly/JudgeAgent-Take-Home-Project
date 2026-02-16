from openai import OpenAI

from judge_agent.models import JudgeResult, PromptLog
from judge_agent.parse import parse_judge_response
from judge_agent.prompts import TEXT_JUDGE_SYSTEM, TEXT_JUDGE_USER


def analyze_text(client: OpenAI, text: str, model: str = "google/gemini-3-flash-preview") -> JudgeResult:
    user = TEXT_JUDGE_USER.format(text=text)
    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": TEXT_JUDGE_SYSTEM},
            {"role": "user", "content": user},
        ],
        temperature=0.2,
        max_tokens=1024,
        response_format={"type": "json_object"},
    )
    raw = response.choices[0].message.content or "{}"

    usage = response.usage
    prompt_log = PromptLog(
        model=model,
        system_prompt=TEXT_JUDGE_SYSTEM,
        user_prompt=user,
        raw_response=raw,
        prompt_tokens=usage.prompt_tokens if usage else None,
        completion_tokens=usage.completion_tokens if usage else None,
        total_tokens=usage.total_tokens if usage else None,
    )

    result = parse_judge_response(raw, "text")
    result.prompt_log = prompt_log
    return result
