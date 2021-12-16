const getAddress = (address = '', startLen = 5, endLen = 5) => {
  return `${address.substring(0, startLen)}...${address.substring(
    address.length - endLen,
    address.length,
  )}`;
};

export default getAddress;
