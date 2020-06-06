import Message from '../../database/models/Message';

const global$limit = 20;

export const getMessagesOnLoad = async (req, res) => {
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


export const getMoreMessages = async (req, res) => {
  try {
    const { last } = req.params;
    const agg = [
      { $match: { createdAt: { $lt: new Date(last) } } },
      { $sort: { createdAt: -1 } },
      { $limit: global$limit }
    ];

    const messages = await Message.aggregate(agg);

    if (!messages) {
      return res.json([]);
    }

    return res.send(messages);

  } catch (err) {
    return res.status(500).json(err.message);
  }
};