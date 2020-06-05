export const getDataOnLoad = (req, res) => {
  // do db stuff
  res.json([{ username: 'test', message: 'test' }]);
};