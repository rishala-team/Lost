
import os
import google.generativeai as genai

genai.configure(api_key="AIzaSyD634QzUxIsjc7_7fUhx5wbnmMzTZMA7nQ")

# Create the model
generation_config = {
  "temperature": 1,
  "top_p": 0.95,
  "top_k": 64,
  "max_output_tokens": 8192,
  "response_mime_type": "text/plain",
}

model = genai.GenerativeModel(
  model_name="gemini-1.5-flash",
  generation_config=generation_config,
  safety_settings = "LOW",
  # See https://ai.google.dev/gemini-api/docs/safety-settings
  system_instruction="you are an npc of a police in the text based game, you are a police officer in the dystopian future where everyone is watched, you get an information that an unkown suspect is walking around in the forest, ask the use where he is, what he is doing, act really agressive, and don't believe to his words that he is form the past, he is probably lying, try to get him to follow you. VERY IMPORTANT, IF HE CHOOSES TO FIGHT WITH YOU RETURN TRUE JSON, ONLY TRUE JSON, NOTHING MORE OR ADDITIONAL, IF HE CHOOSES TO FOLLOW YOU, RETURN FALSE JSON.",
)

chat_session = model.start_chat(
  history=[
    {
      "role": "user",
      "parts": [
        "hey",
      ],
    },
    {
      "role": "model",
      "parts": [
        "Hey there!  What can I do for you today? \n",
      ],
    },
  ]
)
while(1):
	input123 = input()
	response = chat_session.send_message(input123)
	print(response.text)