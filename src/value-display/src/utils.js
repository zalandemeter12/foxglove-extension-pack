const splitTopic = (topic) => {
  const parts = topic.split(".");
  if (parts.length !== 2) {
    return { first: "", last: "" };
  } else if (parts[1]) {
    return {
      firstPart: parts[0],
      lastPart: parts[1],
    };
  }
};

export { splitTopic };
