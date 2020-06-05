// DOMpurify config
DOMPurify.setConfig({ALLOWED_TAGS: []});

// fetch data
fetch('/api/dataOnLoad')
  .then(res => res.json())
  .then(data => {
    data.forEach(message => messages.innerHTML += `<p><span class="username">${DOMPurify.sanitize(message.username)}: </span>${DOMPurify.sanitize(message.message)}</p>`);
    messages.innerHTML += '<p>Contribute to the conversation...</p>';
  })
  .catch(console.log);