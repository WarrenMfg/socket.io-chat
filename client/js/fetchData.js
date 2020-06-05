// DOMpurify config
DOMPurify.setConfig({ALLOWED_TAGS: []});


// fetch messages on load
fetch('/api/messagesOnLoad')
  .then(res => res.json())
  .then(data => {
    data.forEach(message => messages.innerHTML += `
      <p data-createdat=${message.createdAt}><span class="username">${DOMPurify.sanitize(message.username)}: </span>${DOMPurify.sanitize(message.message)}</p>
    `);
  })
  .catch(console.log);


// get more messages
const getMoreMessages = last => {
  fetch(`/api/getMoreMessages/${last}`)
    .then(res => res.json())
    .then(data => {
      data.forEach(message => messages.innerHTML += `
        <p data-createdat=${message.createdAt}><span class="username">${DOMPurify.sanitize(message.username)}: </span>${DOMPurify.sanitize(message.message)}</p>
      `);
    })
    .catch(console.log);
};

// throttled infinite scrolling
messages.onscroll = ( () => {
  let throttledInfiniteScrollingTimeoutID;
  let messagesRect = messages.getBoundingClientRect();

  return () => {
    if (!throttledInfiniteScrollingTimeoutID) {
      // assign throttledInfiniteScrollingTimeoutID
      throttledInfiniteScrollingTimeoutID = setTimeout(() => {
        const last = messages.lastElementChild;
        const lastRect = last.getBoundingClientRect();

        if (lastRect.top <= (messagesRect.bottom + (messagesRect.height / 2))) {
          // get more messages
          getMoreMessages(last.dataset.createdat);
          throttledInfiniteScrollingTimeoutID = null;

        } else {
          throttledInfiniteScrollingTimeoutID = null;
        }
      }, 500);
    }
  };

})();