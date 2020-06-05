import Message from '../../database/messageModel';

const global$limit = 10;

export const getDataOnLoad = async (req, res) => {
  try {
    const messages = await Message.aggregate([ { $sort: { createdAt: -1 } }, { $limit: global$limit } ]);

    if (!messages) {
      return res.json([]);
    }

    return res.send(messages);

  } catch (err) {
    return res.status(500).json(err.message);
  }
};