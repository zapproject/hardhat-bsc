import random from 'lodash/random';

export const nodes = [
  process.env.REACT_APP_NODE_1,
  process.env.REACT_APP_NODE_2,
  process.env.REACT_APP_NODE_3,
  process.env.REACT_APP_NODE_4,
  process.env.REACT_APP_NODE_5,
  process.env.REACT_APP_NODE_6,
];

export const bsc_nodes = [
  process.env.REACT_APP_NODE_1_BSC,
  process.env.REACT_APP_NODE_2_BSC,
  process.env.REACT_APP_NODE_3_BSC,
];

export const chapel_nodes = [
  process.env.REACT_APP_NODE_1_CHAPEL,
  process.env.REACT_APP_NODE_2_CHAPEL,
  process.env.REACT_APP_NODE_3_CHAPEL,
];

const getNodeUrl = () => {
  const randomIndex = random(0, nodes.length - 1);
  return nodes[randomIndex];
};

export default getNodeUrl;
