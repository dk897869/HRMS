const mongoose = require('mongoose');
const Setting = require('../src/models/Setting');

mongoose.connect('mongodb+srv://developerdeepak897:i46x6vF87f4t8N@cluster0.zox7b.mongodb.net/lexvra-hrms?retryWrites=true&w=majority&appName=Cluster0')
  .then(async () => {
    console.log('Connected to DB. Updating Settings...');
    const result = await Setting.updateOne({}, {
      $set: {
        companyName: 'PayFlexPayroll',
        companyLogoUrl: '/PayFlexPayroll Logo.png',
        subscriptionPlan: 'Free Trial',
        trialStartDate: new Date()
      }
    }, { upsert: true });
    console.log('Update Result:', result);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
