const generateMessage = (username, text) => {
  return {
    username,
    text,
    createdAt: new Date().getTime()
  }
}

const generateLocationMessage = (username, latitude, longitude) => {
  const url = `https://google.com/maps?q=${latitude},${longitude}`
  return {
    username,
    url,
    createdAt: new Date().getTime()
  }
}

module.exports = {
  generateMessage,
  generateLocationMessage
}