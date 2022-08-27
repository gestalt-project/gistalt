function sendDataToParent(message) {
  getMessageFromChild(message);
  console.log("recieved message from child: ");
  console.log(messageFromChild);
};

export { sendDataToParent }