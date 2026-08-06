const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { uploadChatFile, uploadAvatar } = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');

// All chat routes require authentication
router.use(protect);

router.get('/users', chatController.getChatUsers);
router.get('/conversations', chatController.getConversations);
router.post('/conversations', chatController.createConversation);  // Create or get existing DM
router.get('/messages/:conversationId', chatController.getMessages);
router.post('/messages', chatController.sendMessage);
router.post('/groups', chatController.createGroup);
router.post('/upload', uploadChatFile.single('file'), chatController.uploadFile);
router.post('/avatar', uploadAvatar.single('avatar'), chatController.updateAvatar);
router.delete('/messages/:conversationId', chatController.clearChat);
router.delete('/conversation/:conversationId', chatController.deleteConversation);
router.post('/messages/react', chatController.reactToMessage);
router.delete('/message/:messageId', chatController.deleteMessage);
router.put('/messages/:messageId/pin', chatController.pinMessage);
router.get('/search', chatController.searchChats);
router.post('/channels', chatController.createChannel);

module.exports = router;
