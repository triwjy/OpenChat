const socket = io();

// Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $shareLocationButton = document.querySelector('#share-location')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

socket.on('message', ({ username, text, createdAt }) => {
  console.log(text, createdAt);
  const html = Mustache.render(messageTemplate, {
    username,
    message: text,
    createdAt: moment(createdAt).format('HH:mm')
  });
  $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('locationMessage', ({ username, url, createdAt }) => {
  console.log(url, createdAt);
  const html = Mustache.render(locationMessageTemplate, {
    username,
    mapURL: url,
    createdAt: moment(createdAt).format('HH:mm')
  });
  $messages.insertAdjacentHTML('beforeend', html)
})

$messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  $messageFormButton.setAttribute('disabled', 'disabled');
  const message = e.target.elements.message.value
  
  socket.emit('sendMessage', message, (error) => {
    $messageFormButton.removeAttribute('disabled');

    if (error) {
      return console.log(error);
    }
    console.log('Message delivered');
  });
  $messageForm.reset();
})

$shareLocationButton.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser')
  }

  $shareLocationButton.setAttribute('disabled', 'disabled');
  
  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;
    socket.emit('sendLocation', { latitude, longitude }, () => {
      console.log('Location shared!');
      $shareLocationButton.removeAttribute('disabled');
    });
  })
})

socket.emit('join', { username, room }, (error) => {
  if(error) {
    alert(error);
    location.href = '/';
  }
})