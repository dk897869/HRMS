const mongoose = require('mongoose');
const MONGO_URI = 'mongodb+srv://infinologylexvra_db_user:0lwvLNuueDINgUPA@cluster0.zxmnjlc.mongodb.net/lexvra_payroll?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI).then(async () => {
  const db = mongoose.connection.db;
  
  // Get valid employee IDs
  const emps = await db.collection('employees').find({}).toArray();
  const validIds = emps.map(e => e._id.toString());
  console.log('Valid employee IDs:', validIds);

  // Get all conversations
  const convos = await db.collection('conversations').find({}).toArray();
  console.log('Total conversations:', convos.length);
  
  // Find conversations with deleted participants
  const toDelete = [];
  for (const c of convos) {
    const parts = (c.participants || []).map(p => p.toString());
    const allValid = parts.every(p => validIds.includes(p));
    if (!allValid) {
      toDelete.push(c._id);
      console.log('Will delete conversation:', c._id, 'participants:', parts);
    }
  }
  
  console.log('Conversations to delete (orphaned):', toDelete.length);
  
  if (toDelete.length > 0) {
    await db.collection('conversations').deleteMany({ _id: { $in: toDelete } });
    await db.collection('messages').deleteMany({ conversationId: { $in: toDelete } });
    console.log('Deleted orphaned conversations and their messages!');
  }
  
  // Check designation for LX002
  const deepak = emps.find(e => e.employeeId === 'LX002');
  console.log('LX002 employee:', JSON.stringify(deepak, null, 2));
  if (deepak && deepak.designation) {
    const desig = await db.collection('designations').findOne({ _id: deepak.designation });
    console.log('LX002 designation:', desig);
    const dept = await db.collection('departments').findOne({ _id: deepak.department });
    console.log('LX002 department:', dept);
  }
  
  process.exit(0);
}).catch(console.error);
