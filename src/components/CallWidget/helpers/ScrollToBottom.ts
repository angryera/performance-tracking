const scrollToBottomHelper = (
  messageListRef: React.RefObject<HTMLDivElement>,
  inputRef: React.RefObject<HTMLTextAreaElement>
) => {
  if (messageListRef.current) {
    messageListRef.current.scrollTo({
      top: messageListRef.current.scrollHeight,
      behavior: "smooth",
    });
  }

  // Focus the input box after scrolling
  setTimeout(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, 300); // Wait for scroll animation to complete
};

export default scrollToBottomHelper;
