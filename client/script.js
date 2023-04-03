import bot from './assests/bot.svg';
import user from './assests/user.svg';

const form  = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;


//function that loads the message, and while it is waiting it will produce 3 dots
//it resets every 300 m/s 
function loader(element) {
  element.textContent = '' //looks if the string is empty

  loadInterval = setInterval (() => {
    element.textContent  += '.';

    if (element.textContext === '...') {
      element.textContent = ''; //what this is doing is once it hits the 3 dots then it will reset to empty string, then function resets
    }
  }, 300)
}

//this function will produce a typing scenario as if the bot is thinking and tpying out the answers instead of giving you the answer all at once
function typeText(element, text){
  let index = 0

  let interval = setInterval(() => {
    if(index < text.length){
      element.innerHTML += text.charAt(index);
      index++;
    }else {
      clearInterval(interval);
    }
  }, 20)
}

//create a unique ID for each chat
//added a lot of different variable to make sure it is completely unique
function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

//create a function to see the different between our chat vs AI
//stripe in the UI
function chatStripe(isAi, value, uniqueId) {
  return (
      `
      <div class="wrapper ${isAi && 'ai'}">
          <div class="chat">
              <div class="profile">
                  <img 
                    src=${isAi ? bot : user} 
                    alt="${isAi ? 'bot' : 'user'}" 
                  />
              </div>
              <div class="message" id=${uniqueId}>${value}</div>
          </div>
      </div>
  `
  )
}

//function handle submit function. To trigger AI generative response
const handleSubmit = async (e) => {
  e.preventDefault()

  const data = new FormData(form)

  //generate user chat stripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));

  //reset form
  form.reset();

  //AI chat stripe
  const uniqueId = generateUniqueId()
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  //be able to scroll
  chatContainer.scrollTop = chatContainer.scrollHeight;

  //pass the message from the uniqueID chat generater
  const messageDiv = document.getElementById(uniqueId);

  //load message
  loader(messageDiv);

  //fetch the data from the server bot

  const response = await fetch('http://localhost:5173/', {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify ({
      prompt: data.get('prompt')
    })
  })


  clearInterval(loadInterval)
  messageDiv.innerHTML = " "

  if (response.ok) {
      const data = await response.json();
      const parsedData = data.bot.trim() // trims any trailing spaces/'\n' 

      typeText(messageDiv, parsedData)
  } else {
      const err = await response.text()

      messageDiv.innerHTML = "Something went wrong"
      alert(err)
  }
}

//listener to handle the submit
//submit using the enter key
form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        handleSubmit(e)
    }
})