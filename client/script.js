import bot from './assets/bot.svg'
import user from './assets/user.svg'

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

function loader(element){
  element.textContent = '';
  loadInterval = setInterval(()=> {
    element.textContent += '.';
    if (element.textContent === '...'){
      element.textContent = '';
    }
  }, 300)
}

function typeText(element, text) {
  let index = 0;
  let interval = setInterval(()=> {
    if(index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
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
    <div class="wrapper" ${isAi && 'ai'}">
      <div class="chat">
        <div class="profile">
          <img 
            src="${isAi ? bot : user}"
            alt="${isAi ? 'bot' : 'user'}"
          />
        </div>
        <div class="message" id="${uniqueId}">${value}</div>
      </div>
    </div>
    ` 
  )
}

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  // User's chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));
  form.reset();

  // AI chatstripe
  const uniqueId = generateUniqueId();
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

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();
    typeText(messageDiv, parsedData);
  } else {
    const err = await response.text();
    messageDiv.innerHTML = "Something went wrong!";
    alert(err);
  }
}


form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13){
    handleSubmit(e);
  }
});

