import bot from './assets/bot.svg'
import user from './assets/user.svg'
import Prism from 'prismjs'

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

function highlightCode(text, languages) {
  const messageDiv = document.getElementById("messageDiv");
  const supportedLanguages = {
    "C": "c",
    "C++": "cpp",
    "C#": "csharp",
    "CSS": "css",
    "Go": "go",
    "HTML": "html",
    "Java": "java",
    "JavaScript": "javascript",
    "JSON": "json",
    "Kotlin": "kotlin",
    "Markdown": "markdown",
    "PHP": "php",
    "Python": "python",
    "Ruby": "ruby",
    "Rust": "rust",
    "SQL": "sql",
    "TypeScript": "typescript",
    "XML": "xml"
  };
  
  for (const language of languages) {
    if (text.includes(language)) {
      messageDiv.innerHTML = text;
      Prism.highlightElement(messageDiv, false, () => {
        messageDiv.classList.add(`language-${supportedLanguages[language]}`);
      });
      return;
    }
  }
  messageDiv.innerHTML = text;
}
  
const languages = ["JavaScript", "Python", "Ruby", "C++", "Java", "Go", "C#", "CSS", "HTML", "SQL", "PHP", "Rust", "Kotlin", "TypeScript", "XML", "Markdown", "JSON"];


function loader(element){
  element.textContent = '';
  loadInterval = setInterval(()=> {
    element.textContent += '.';
    if (element.textContent === '......'){
      element.textContent = '';
    }
  }, 300)
}

function typeText(element, text) {
  let words = text.split(" ");
  let index = 0;
  let wordIndex = 0;
  let interval = setInterval(() => {
    if (index < text.length) {
      let tempElement = document.createElement("span");
      tempElement.style.visibility = "hidden";
      tempElement.style.whiteSpace = "nowrap";
      tempElement.innerHTML = element.innerHTML + words[wordIndex] + " ";
      document.body.appendChild(tempElement);
      if (tempElement.offsetWidth > 0.5 * window.innerWidth) {
        element.innerHTML += "<br>";
      }
      element.innerHTML += words[wordIndex] + " ";
      index += words[wordIndex].length + 1;
      wordIndex++;
      document.body.removeChild(tempElement);
    } else {
      clearInterval(interval);
    }
  }, 20);
}


function generateRandomString(stringLength) {
  let str = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < stringLength; i++) {
      str += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return str; 
}

console.log(generateRandomString(32));



function generateUniqueId() {
  const timestamp = Date.now();
  console.log(`id-${timestamp}-${generateRandomString(8)}`)
  return `id-${timestamp}-${generateRandomString(8)}`;
}

function chatStripe (isAi, value, uniqueId) {
  return (
    `
    <div class="wrapper ${isAi && 'ai'}">
      <div class="chat">
        <div class="profile">
          <img 
            src="${isAi ? bot : user}"
            alt="${isAi ? 'bot' : 'user'}"
          />
        </div>
        <pre class="language-markup"><code class="message no-scroll" id="${uniqueId}">${value}</code></pre>
      </div>
    </div>
    ` 
  )
}

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  // User's chatstripe
  let UniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'), 'user');
  form.reset();

  // AI chatstripe
  let uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  const messageDiv = document.getElementById(uniqueId);
  loader(messageDiv);

  // fetch the data from the server, aka the AI response
  const response = await fetch('https://bertaai.onrender.com', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  })

  clearInterval(loadInterval);
  messageDiv.innerHTML = '';
  Prism.highlightAll();

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();
    typeText(messageDiv, parsedData);
    Prism.highlightAll();
  } else {
    const err = await response.text();
    messageDiv.innerHTML = "Something went wrong!";
    Prism.highlightAll();
    alert(err);
  }
}


form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13){
    handleSubmit(e);
    Prism.highlightAll();
  }
});

