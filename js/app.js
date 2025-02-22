import { config } from "./config.js";

const sendChatBtn = document.querySelector(".chat-input .send-btn");
const userChatInput = document.querySelector(".chat-input textarea");
const chatbox = document.querySelector(".chatbox");
const chatbotTogglerBtn = document.querySelector(".chatbot-toggler");
const closeChatbotBtn = document.querySelector(".close-btn");

const createChatBubble = (message, className) => {
  const chatBubble = document.createElement("li");
  const chatBubbleText = document.createElement("p");

  chatBubble.classList.add(className, "chat");

  if (className === "incoming") {
    const chatBubbleBot = document.createElement("i");
    chatBubbleBot.classList.add("bx", "bx-bot");
    chatBubble.appendChild(chatBubbleBot);
  }

  chatBubbleText.textContent =
    className === "outgoing" ? message : "Thinking...";

  chatBubble.appendChild(chatBubbleText);
  chatbox.appendChild(chatBubble);
};

// Gemini API
const generateBotResponse = async () => {
  const botChatBubbleText = document.querySelector(".incoming:last-child p");

  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gemini-1.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: userMessage }],
        },
      ],
    }),
  };

  try {
    const response = await fetch(
      `${config.API_URL}?key=${config.API_KEY}`,
      requestOptions
    );
    const data = await response.json();
    const botResponse = data.candidates[0].content.parts[0].text;

    botChatBubbleText.textContent = botResponse;
  } catch (err) {
    botChatBubbleText.classList.add("error");
    botChatBubbleText.textContent = "Sorry, I'm having trouble right now.";
    console.error(err);
  } finally {
    chatbox.scrollTo(0, chatbox.scrollHeight); // 確保對話框總是顯示最新的對話
  }
};

let userMessage;
const handleSendChat = () => {
  userMessage = userChatInput.value;
  if (!userMessage) return;

  createChatBubble(userMessage, "outgoing");

  userChatInput.value = "";

  chatbox.scrollTo(0, chatbox.scrollHeight); // 確保對話框總是顯示最新的對話

  setTimeout(() => {
    createChatBubble("Thinking...", "incoming");
    chatbox.scrollTo(0, chatbox.scrollHeight); // 確保對話框總是顯示最新的對話
    generateBotResponse();
  }, 500);
};

sendChatBtn.addEventListener("click", handleSendChat);

const inputInitHeight = userChatInput.scrollHeight;
userChatInput.addEventListener("input", () => {
  userChatInput.style.height = `${inputInitHeight}px`;
  userChatInput.style.height = `${userChatInput.scrollHeight}px`;
});

let isComposing = false; // 是否正在輸入中文
userChatInput.addEventListener("compositionstart", () => {
  isComposing = true;
});

userChatInput.addEventListener("compositionend", () => {
  isComposing = false;
});

userChatInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey && !isComposing) {
    event.preventDefault(); // 防止 textarea 換行
    handleSendChat();
  }
});

chatbotTogglerBtn.addEventListener("click", () =>
  document.body.classList.toggle("show-chatbot")
);

closeChatbotBtn.addEventListener("click", () => {
  document.body.classList.remove("show-chatbot");
});
