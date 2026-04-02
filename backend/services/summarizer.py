import os
from anthropic import Anthropic
from openai import OpenAI

SUMMARY_PROMPT = """You are a video content analyst. Given the following transcript of a video, provide:

1. **Title**: Infer a clear, descriptive title for the video.
2. **Summary**: Write a well-structured summary in 2-3 paragraphs.
3. **Key Points**: List 5-7 key takeaways as bullet points.

Format your response exactly as:

# Title
[inferred title]

## Summary
[summary paragraphs]

## Key Points
- [point 1]
- [point 2]
...

Transcript:
{transcript}"""


def summarize_with_claude(transcript: str) -> str:
    """Summarize using Claude claude-sonnet-4-5."""
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY is not configured. Add it to your .env file.")
    client = Anthropic(api_key=api_key)

    message = client.messages.create(
        model="claude-sonnet-4-5-20250514",
        max_tokens=1500,
        messages=[
            {"role": "user", "content": SUMMARY_PROMPT.format(transcript=transcript)}
        ],
    )
    return message.content[0].text


def summarize_with_gpt(transcript: str) -> str:
    """Summarize using GPT-4o."""
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY is not configured. Add it to your .env file.")
    client = OpenAI(api_key=api_key)

    response = client.chat.completions.create(
        model="gpt-4o",
        max_tokens=1500,
        messages=[
            {"role": "user", "content": SUMMARY_PROMPT.format(transcript=transcript)}
        ],
    )
    return response.choices[0].message.content


def summarize(transcript: str, model: str) -> str:
    """Route to the chosen LLM provider."""
    if model == "claude":
        return summarize_with_claude(transcript)
    elif model == "gpt":
        return summarize_with_gpt(transcript)
    else:
        raise ValueError(f"Unsupported model: {model}. Use 'claude' or 'gpt'.")
