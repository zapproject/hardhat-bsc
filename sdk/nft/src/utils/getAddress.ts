export const getAddress = (address = '', lengthStart = 5, lengthEnd = 5) => {
  return `${address.substring(0, lengthStart)}...${address.substring(
    address.length - lengthEnd,
    address.length,
  )}`;
};
