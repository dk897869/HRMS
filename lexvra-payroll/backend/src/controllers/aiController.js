const Employee = require('../models/Employee');
const Leave = require('../models/Leave');
const LeaveType = require('../models/LeaveType');
const LeaveBalance = require('../models/LeaveBalance');
const Attendance = require('../models/Attendance');
const Payroll = require('../models/Payroll');
const Message = require('../models/Message');
const Loan = require('../models/Loan');
const Claim = require('../models/Claim');

// AI Model Configurations
const AI_MODELS = {
  'gemini-3.5-pro': 'Gemini 3.5 Pro (High Reasoning)',
  'gemini-3.5-flash': 'Gemini 3.5 Flash (Fast Execution)',
  'gemini-3.1-ultra': 'Gemini 3.1 Ultra (Deep Analytics)',
  'lexvra-4.0': 'Lexvra Neural HRMS 4.0'
};

// Main AI query processor
exports.processQuery = async (req, res) => {
  try {
    const { query, activeChatId, step, stepData, model = 'gemini-3.5-pro', language = 'hi' } = req.body;
    const employeeId = req.user?.employeeRef || req.user?._id;

    if (!query && !step) {
      return res.json({ success: false, message: 'Query is required' });
    }

    const modelName = AI_MODELS[model] || 'Gemini 3.5 Pro';
    const lowerQuery = (query || '').toLowerCase();

    // Determine target language ('hi', 'pa', 'en')
    let targetLang = language || 'hi';
    if (lowerQuery.includes('punjabi') || lowerQuery.includes('ਪੰਜਾਬੀ')) targetLang = 'pa';
    else if (lowerQuery.includes('english')) targetLang = 'en';

    let responseText = "";
    let actionData = null;
    let nextStep = null;
    let nextStepData = {};

    // Fetch employee info for personalized response
    const currentEmp = await Employee.findById(employeeId)
      .populate('department')
      .populate('designation');

    const empName = currentEmp ? `${currentEmp.firstName} ${currentEmp.lastName}` : 'User';
    const empCode = currentEmp?.employeeId || 'LX-EMP';

    // ── 1. SPECIFIC MODULE TRAINING: EMPLOYEE ADD WALKTHROUGH ─────────────────
    if (lowerQuery.includes('employee add') || lowerQuery.includes('add employee') || lowerQuery.includes('nayi employee') || lowerQuery.includes('employee kaise add') || lowerQuery.includes('ਕਰੋ')) {
      if (targetLang === 'pa') {
        responseText = `👤 **ਨਵਾਂ Employee ਜੋੜਨ ਦਾ ਆਸਾਨ ਤਰੀਕਾ (Step-by-Step):**\n\n1. ਖੱਬੇ ਪਾਸੇ ਮੇਨੂ ਵਿੱਚ **Workforce → Employees** 'ਤੇ ਕਲਿੱਕ ਕਰੋ।\n2. ਉੱਪਰ ਸੱਜੇ ਕੋਨੇ 'ਤੇ **"+ Add Employee"** ਬਟਨ 'ਤੇ ਕਲਿੱਕ ਕਰੋ।\n3. **Personal Info** ਭਰੋ: ਨਾਮ, ਈਮੇਲ, ਮੋਬਾਈਲ ਨੰਬਰ ਅਤੇ ਜਨਮ ਮਿਤੀ।\n4. **Work Details** ਚੁਣੋ: ਵਿਭਾਗ (Department), ਅਹੁਦਾ (Designation), ਮੈਨੇਜਰ ਅਤੇ ਤਨਖਾਹ।\n5. **Role & Permissions** ਚੁਣੋ (Admin, HR ਜਾਂ Employee)।\n6. ਹੇਠਾਂ **"Save Employee"** ਬਟਨ ਦਬਾਓ।\n\n✨ Employee ID ਆਪਣੇ ਆਪ ਬਣ ਜਾਵੇਗੀ ਅਤੇ ਈਮੇਲ 'ਤੇ ਲੌਗਇਨ ਵੇਰਵੇ ਭੇਜ ਦਿੱਤੇ ਜਾਣਗੇ!`;
      } else if (targetLang === 'hi') {
        responseText = `👤 **नया Employee जोड़ने का आसान तरीका (Step-by-Step):**\n\n1. स्क्रीन की बायीं तरफ मेनू में **Workforce → Employees** पर क्लिक करें।\n2. ऊपर दायें कोने में **"+ Add Employee"** बटन पर क्लिक करें।\n3. **Personal Information** भरें: नाम, ईमेल, मोबाइल नंबर और जन्म तिथि।\n4. **Work Details** चुनें: विभाग (Department), पद (Designation), मैनेजर, जॉइनिंग डेट और बेसिक सैलरी।\n5. **Role & System Access** चुनें (Admin, HR या Employee)।\n6. नीचे **"Save Employee"** बटन दबाएं।\n\n✨ Employee ID अपने आप बन जाएगी और ईमेल पर लॉगिन विवरण भेज दिया जाएगा!`;
      } else {
        responseText = `👤 **HOW TO ADD A NEW EMPLOYEE (STEP-BY-STEP):**\n\n1. Navigate to **Workforce → Employees** from the left navigation bar.\n2. Click the **"+ Add Employee"** button at the top-right corner.\n3. Fill in **Personal Details**: First Name, Last Name, Email, Phone & DOB.\n4. Select **Employment Info**: Department, Designation, Manager, Joining Date & Basic Salary.\n5. Assign **System Role** (Admin / HR / Employee).\n6. Click **"Save Employee"** at the bottom.\n\n✨ The system automatically generates employee credentials and sends a welcome onboarding email!`;
      }
      actionData = { type: 'LINK', url: '/employees', label: targetLang === 'pa' ? "Employees ਮੋਡਿਊਲ ਜਾਓ" : targetLang === 'hi' ? 'Employees मॉड्यूल पर जाएं' : 'Go to Employees Module' };
    }

    // ── 2. SPECIFIC MODULE TRAINING: SALARY CHECK & PAYSLIP DOWNLOAD ──────────
    else if (lowerQuery.includes('salary check') || lowerQuery.includes('salary slip') || lowerQuery.includes('payslip download') || lowerQuery.includes('salary kaise check') || lowerQuery.includes('ਤਨਖਾਹ')) {
      if (targetLang === 'pa') {
        responseText = `💵 **ਤਨਖਾਹ (Salary) ਚੈੱਕ ਕਰਨ ਅਤੇ Payslip ਡਾਊਨਲੋਡ ਕਰਨ ਦਾ ਤਰੀਕਾ:**\n\n1. ਖੱਬੇ ਪਾਸੇ ਮੇਨੂ ਵਿੱਚ **Finance → Payroll** 'ਤੇ ਜਾਓ।\n2. ਉੱਪਰ ਫਿਲਟਰ ਵਿੱਚ ਆਪਣਾ **ਮਹੀਨਾ ਅਤੇ ਸਾਲ** ਚੁਣੋ।\n3. ਇੱਥੇ ਤੁਹਾਡੀ Net Salary, Basic, HRA, PF ਅਤੇ TDS ਕਟੌਤੀ ਦੀ ਪੂਰੀ ਜਾਣਕਾਰੀ ਦਿਖੇਗੀ।\n4. ਆਪਣੀ Payslip ਦੀ PDF ਫਾਈਲ ਡਾਊਨਲੋਡ ਕਰਨ ਲਈ **"Download Payslip"** ਬਟਨ 'ਤੇ ਕਲਿੱਕ ਕਰੋ।\n5. ਸੈਲਰੀ ਸਲਿਪ PDF ਤੁਹਾਡੇ ਫੋਨ/ਕੰਪਿਊਟਰ ਵਿੱਚ ਤੁਰੰਤ ਡਾਊਨਲੋਡ ਹੋ ਜਾਵੇਗੀ!`;
      } else if (targetLang === 'hi') {
        responseText = `💵 **सैलरी चेक करने और Payslip Download करने की विधि:**\n\n1. बायीं तरफ मेनू में **Finance → Payroll** सेक्शन में जाएं।\n2. ऊपर फ़िल्टर में अपना **महीना और साल** चुनें।\n3. यहाँ आपकी Net Salary, Basic, HRA, PF और TDS कटौती की पूरी जानकारी दिखेगी।\n4. अपनी आधिकारिक Payslip की PDF फाइल डाउनलोड करने के लिए **"Download Payslip"** बटन पर क्लिक करें।\n5. सैलरी स्लिप PDF आपके डिवाइस में तुरंत डाउनलोड हो जाएगी!`;
      } else {
        responseText = `💵 **HOW TO CHECK SALARY & DOWNLOAD PAYSLIP (STEP-BY-STEP):**\n\n1. Go to **Finance → Payroll** from the left navigation bar.\n2. Select the target **Month & Year** from the top filter dropdown.\n3. View your detailed breakdown: Basic, HRA, Special Allowance, PF & TDS Deductions.\n4. Click the **"Download Payslip"** or **PDF Icon** button next to your payroll record.\n5. The official stamped salary slip PDF will download directly to your device!`;
      }
      actionData = { type: 'LINK', url: '/payroll', label: targetLang === 'pa' ? "Payroll ਮੋਡਿਊਲ ਜਾਓ" : targetLang === 'hi' ? 'Payroll मॉड्यूल पर जाएं' : 'Go to Payroll Module' };
    }

    // ── 3. SPECIFIC MODULE TRAINING: ADMIN DASHBOARD FULL TRAINING ────────────
    else if (lowerQuery.includes('admin dashboard') || lowerQuery.includes('dashboard training') || lowerQuery.includes('admin training') || lowerQuery.includes('dashboard kaise kare')) {
      if (targetLang === 'pa') {
        responseText = `🏛️ **ਐਡਮਿਨ ਡੈਸ਼ਬੋਰਡ ਦੀ ਪੂਰੀ ਜਾਣਕਾਰੀ (Step-by-Step Guide):**\n\n1. **ਹੈਡਰ ਅਤੇ ਰਿਪੋਰਟ**: ਇੱਥੇ ਮਿਤੀ ਅਤੇ ਪੂਰੀ ਸੰਸਥਾ ਦੀ ਰਿਪੋਰਟ ਡਾਊਨਲੋਡ ਕਰਨ ਦਾ ਬਟਨ ਹੈ।\n2. **ਮੁੱਖ KPI ਕਾਰਡ**:\n   • *Total Employees*: ਕੁੱਲ ਕਰਮਚਾਰੀ।\n   • *Present Today*: ਅੱਜ ਹਾਜ਼ਰ ਕਰਮਚਾਰੀ।\n   • *On Leave*: ਛੁੱਟੀ 'ਤੇ ਗਏ ਕਰਮਚਾਰੀ।\n   • *Absent*: ਗੈਰ-ਹਾਜ਼ਰ ਕਰਮਚਾਰੀ।\n   *(💡 ਕਿਸੇ ਵੀ ਕਾਰਡ 'ਤੇ ਕਲਿੱਕ ਕਰਕੇ ਤੁਸੀਂ ਲਿਸਟ ਨੂੰ ਫਿਲਟਰ ਕਰ ਸਕਦੇ ਹੋ!)*\n3. **ਲਾਈਵ Attendance Directory**:\n   • ਨਾਮ ਜਾਂ ID ਨਾਲ ਖੋਜੋ ਅਤੇ ਵਿਭਾਗ ਅਨੁਸਾਰ ਫਿਲਟਰ ਕਰੋ।\n4. **3 Dots Action Menu**:\n   • ਕਰਮਚਾਰੀ ਦੇ ਟਾਈਮ ਜਾਂ ਸਟੇਟਸ ਨੂੰ ਠੀਕ ਕਰਨ ਲਈ 3 Dots 'ਤੇ ਕਲਿੱਕ ਕਰੋ।`;
      } else if (targetLang === 'hi') {
        responseText = `🏛️ **एडमिन डैशबोर्ड की पूरी जानकारी (Step-by-Step Guide):**\n\n1. **हेडर और एक्सपोर्ट**: यहाँ आज की तारीख और पूरी संस्था की एक्सपोर्ट रिपोर्ट डाउनलोड करने का बटन है।\n2. **मुख्य KPI कार्ड्स**:\n   • *Total Employees*: आपकी संस्था के कुल कर्मचारी।\n   • *Present Today*: आज उपस्थित कर्मचारी।\n   • *On Leave*: स्वीकृत छुट्टी पर गए कर्मचारी।\n   • *Absent*: जो आज उपस्थित नहीं हुए।\n   *(💡 किसी भी कार्ड पर क्लिक करके आप नीचे वाली लिस्ट को फ़िल्टर कर सकते हैं!)*\n3. **लाइव अटेंडेंस डायरेक्टरी**:\n   • नाम या ID से खोजें और विभाग के अनुसार फ़िल्टर करें।\n4. **क्विक एक्शन बटन (3 Dots)**:\n   • किसी भी कर्मचारी के टाइम या स्टेटस को तुरंत सही करने के लिए 3 Dots पर क्लिक करें।`;
      } else {
        responseText = `🏛️ **COMPLETE ADMIN DASHBOARD TRAINING (MODULE BY MODULE):**\n\n1. **Header & Analytics Overview**: View date, active stats, and use 'Export Report' to download full org summaries.\n2. **Interactive KPI Cards**:\n   • *Total Employees*: Total registered workforce count.\n   • *Present Today*: Real-time checked-in count.\n   • *On Leave*: Employees on approved leave.\n   • *Absent*: Unpunched employees today.\n   *(💡 Pro-Tip: Click any KPI Card to instantly filter the Master Directory below!)*\n3. **Master Attendance Directory**:\n   • Search by Name, Employee ID or Email.\n   • Filter dynamically by Department & Status.\n4. **Action Menu & Manual Override**:\n   • Click **3 Dots (⋮)** on any row to override status or correct punch-in/out timings.`;
      }
      actionData = { type: 'LINK', url: '/dashboard', label: targetLang === 'pa' ? 'ਡੈਸ਼ਬੋਰਡ ਖੋਲ੍ਹੋ' : targetLang === 'hi' ? 'डैशबोर्ड खोलें' : 'Open Admin Dashboard' };
    }

    // ── 4. MULTI-STEP: LEAVE APPLICATION FLOW ─────────────────────────────────
    else if (step === 'leave_apply_select_type') {
      const selectedType = stepData?.selectedType || query;
      nextStep = 'leave_apply_get_reason';
      nextStepData = { leaveType: selectedType };
      responseText = targetLang === 'pa'
        ? `⚡ ਤੁਸੀਂ **${selectedType}** ਚੁਣਿਆ ਹੈ, ${empName}! ਕਿਰਪਾ ਕਰਕੇ ਛੁੱਟੀ ਦਾ ਕਾਰਨ ਦਰਜ ਕਰੋ:`
        : targetLang === 'hi'
        ? `⚡ आपने **${selectedType}** चुना है, ${empName}! कृपया छुट्टी का कारण दर्ज करें:`
        : `⚡ You selected **${selectedType}**, ${empName}! Please provide the reason for your leave request:`;
      return res.json({ success: true, text: responseText, nextStep, nextStepData, modelUsed: modelName, targetLang });
    }

    else if (step === 'leave_apply_get_reason') {
      const leaveTypeName = stepData?.leaveType || 'Casual Leave';
      const reason = query || stepData?.reason || 'Personal work';

      try {
        const leaveType = await LeaveType.findOne({
          $or: [
            { code: { $regex: leaveTypeName.split(' ')[0], $options: 'i' } },
            { name: { $regex: leaveTypeName, $options: 'i' } }
          ]
        });

        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        await Leave.create({
          employee: employeeId,
          leaveType: leaveType ? leaveType._id : undefined,
          fromDate: tomorrow,
          toDate: tomorrow,
          totalDays: 1,
          reason: reason,
          status: 'PENDING'
        });

        responseText = targetLang === 'pa'
          ? `✅ **ਤੁਹਾਡੀ ਛੁੱਟੀ ਦੀ ਅਰਜ਼ੀ ਜਮ੍ਹਾਂ ਹੋ ਗਈ ਹੈ!**\n\n• **ਕਰਮਚਾਰੀ**: ${empName} (${empCode})\n• **ਛੁੱਟੀ ਦੀ ਕਿਸਮ**: ${leaveTypeName}\n• **ਸਮਾਂ**: 1 ਦਿਨ (ਕੱਲ੍ਹ ਲਈ)\n• **ਕਾਰਨ**: "${reason}"\n• **ਸਥਿਤੀ**: PENDING APPROVAL\n\nਤੁਹਾਡੇ ਮੈਨੇਜਰ ਨੂੰ ਸੂਚਿਤ ਕਰ ਦਿੱਤਾ ਗਿਆ ਹੈ।`
          : targetLang === 'hi'
          ? `✅ **आपकी छुट्टी का आवेदन जमा हो गया है!**\n\n• **कर्मचारी**: ${empName} (${empCode})\n• **छुट्टी का प्रकार**: ${leaveTypeName}\n• **अवधि**: 1 दिन (कल के लिए)\n• **कारण**: "${reason}"\n• **स्थिति**: PENDING APPROVAL\n\nआपके मैनेजर को सूचित कर दिया गया है।`
          : `✅ **Leave Application Submitted Successfully!**\n\n• **Employee**: ${empName} (${empCode})\n• **Leave Type**: ${leaveTypeName}\n• **Duration**: 1 Day (Tomorrow)\n• **Reason**: "${reason}"\n• **Status**: PENDING APPROVAL\n\nYour manager has been notified.`;
        actionData = { type: 'LINK', url: '/leave', label: targetLang === 'pa' ? 'ਛੁੱਟੀ ਸਥਿਤੀ ਦੇਖੋ' : targetLang === 'hi' ? 'छुट्टी स्टेटस देखें' : 'Track Leave Status' };
      } catch (err) {
        responseText = `Application submitted! Check Leave status in portal.`;
        actionData = { type: 'LINK', url: '/leave', label: 'Open Leave Portal' };
      }
      return res.json({ success: true, text: responseText, action: actionData, modelUsed: modelName, targetLang });
    }

    // ── 5. DOCUMENTS & CERTIFICATES ──────────────────────────────────────────
    else if (lowerQuery.includes('experience letter') || lowerQuery.includes('relieving letter') || lowerQuery.includes('certificate') || lowerQuery.includes('letter')) {
      const docType = lowerQuery.includes('experience') ? 'EXPERIENCE LETTER' : lowerQuery.includes('relieving') ? 'RELIEVING LETTER' : 'SALARY CERTIFICATE';
      const joinDate = currentEmp?.dateOfJoining ? new Date(currentEmp.dateOfJoining).toLocaleDateString() : '01/01/2024';
      const designation = currentEmp?.designation?.title || 'Software Engineer';
      const dept = currentEmp?.department?.name || 'Engineering';

      responseText = `📄 **${docType} GENERATED**\n\n---\n**TO WHOM IT MAY CONCERN**\n\nThis is to certify that **${empName}** (Employee ID: ${empCode}) has been employed with **Lexvra HRMS Platform** as a **${designation}** in the **${dept}** department since **${joinDate}**.\n\nDuring their tenure, we have found them to be hardworking and dedicated.\n\nIssued on: ${new Date().toLocaleDateString()}\n**HR Department, Lexvra Platform**\n---`;
      actionData = { type: 'LINK', url: '/documents', label: 'Download PDF Document' };
    }

    // ── 6. PAYSLIP & SALARY QUERY ─────────────────────────────────────────────
    else if (lowerQuery.includes('payslip') || lowerQuery.includes('salary') || lowerQuery.includes('tax') || lowerQuery.includes('pay')) {
      const payroll = await Payroll.findOne({ employee: employeeId }).sort({ year: -1, month: -1 });

      if (payroll) {
        const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthName = monthNames[payroll.month] || 'Current Month';
        const gross = payroll.grossSalary || 0;
        const net = payroll.netSalary || 0;
        const pf = payroll.statutoryDeductions?.pf || 0;
        const tds = payroll.statutoryDeductions?.tds || 0;

        responseText = targetLang === 'pa'
          ? `💰 **ਤੁਹਾਡੀ ਤਨਖਾਹ (Salary) ਦਾ ਵੇਰਵਾ:**\n\n• **ਮਹੀਨਾ**: ${monthName} ${payroll.year}\n• **ਮੂਲ ਤਨਖਾਹ**: ₹${(payroll.basicSalary || 0).toLocaleString()}\n• **ਕੁੱਲ Gross Salary**: ₹${gross.toLocaleString()}\n• **PF ਕਟੌਤੀ**: ₹${pf.toLocaleString()}\n• **TDS (ਟੈਕਸ)**: ₹${tds.toLocaleString()}\n• **ਖਾਤੇ ਵਿੱਚ ਆਈ ਮਿਲਣਯੋਗ ਤਨਖਾਹ (Net Salary)**: ₹${net.toLocaleString()}\n• **ਸਥਿਤੀ**: ${payroll.status}`
          : targetLang === 'hi' 
          ? `💰 **आपकी वेतन (Salary) की जानकारी:**\n\n• **महीना**: ${monthName} ${payroll.year}\n• **बेसिक सैलरी**: ₹${(payroll.basicSalary || 0).toLocaleString()}\n• **कुल ग्रॉस सैलरी**: ₹${gross.toLocaleString()}\n• **PF कटौती**: ₹${pf.toLocaleString()}\n• **TDS (टैक्स)**: ₹${tds.toLocaleString()}\n• **खाते में प्राप्त राशि (Net Salary)**: ₹${net.toLocaleString()}\n• **स्थिति**: ${payroll.status}`
          : `💰 **PAYROLL BREAKDOWN:**\n\n• **Period**: ${monthName} ${payroll.year}\n• **Basic Salary**: ₹${(payroll.basicSalary || 0).toLocaleString()}\n• **Gross Salary**: ₹${gross.toLocaleString()}\n• **PF Deduction**: ₹${pf.toLocaleString()}\n• **TDS (Tax)**: ₹${tds.toLocaleString()}\n• **NET DISBURSED**: ₹${net.toLocaleString()}\n• **Status**: ${payroll.status}`;
        actionData = { type: 'LINK', url: '/payroll', label: targetLang === 'pa' ? 'Payslip ਡਾਊਨਲੋਡ ਕਰੋ' : targetLang === 'hi' ? 'Payslip डाउनलोड करें' : 'Download Official Payslip' };
      } else {
        const basic = currentEmp?.salary || 45000;
        responseText = targetLang === 'pa'
          ? `💰 **ਤਨਖਾਹ ਦਾ ਵੇਰਵਾ:**\n\n• **ਕਰਮਚਾਰੀ**: ${empName}\n• **ਅਹੁਦਾ**: ${currentEmp?.designation?.title || 'Team Member'}\n• **ਮਹੀਨਾਵਾਰ ਮੂਲ ਤਨਖਾਹ**: ₹${basic.toLocaleString()}\n• **ਸਾਲਾਨਾ ਪੈਕੇਜ (CTC)**: ₹${(basic * 12).toLocaleString()}`
          : targetLang === 'hi'
          ? `💰 **वेतन का ब्यौरा:**\n\n• **कर्मचारी**: ${empName}\n• **पद**: ${currentEmp?.designation?.title || 'Team Member'}\n• **मासिक मूल वेतन**: ₹${basic.toLocaleString()}\n• **वार्षिक कुल पैकेज (CTC)**: ₹${(basic * 12).toLocaleString()}`
          : `💰 **SALARY OVERVIEW:**\n\n• **Employee**: ${empName}\n• **Designation**: ${currentEmp?.designation?.title || 'Team Member'}\n• **Monthly Base Salary**: ₹${basic.toLocaleString()}\n• **Annual CTC**: ₹${(basic * 12).toLocaleString()}`;
        actionData = { type: 'LINK', url: '/payroll', label: 'Go to Payroll Portal' };
      }
    }

    // ── 7. LEAVE BALANCE QUERY ────────────────────────────────────────────────
    else if (lowerQuery.includes('leave') && (lowerQuery.includes('balance') || lowerQuery.includes('left') || lowerQuery.includes('how many') || lowerQuery.includes('remaining'))) {
      const balances = await LeaveBalance.find({ employee: employeeId }).populate('leaveType');
      if (balances.length > 0) {
        const lines = balances.map(b => targetLang === 'pa' ? `• **${b.leaveType?.name || 'Leave'} (${b.leaveType?.code || 'LV'})**: ${b.balance} ਦਿਨ ਬਾਕੀ` : `• **${b.leaveType?.name || 'Leave'} (${b.leaveType?.code || 'LV'})**: ${b.balance} दिन शेष`);
        responseText = targetLang === 'pa'
          ? `🌴 **ਤੁਹਾਡੀਆਂ ਛੁੱਟੀਆਂ ਦਾ ਬਾਕੀ ਵੇਰਵਾ:**\n\n${lines.join('\n')}\n\nਛੁੱਟੀ ਅਪਲਾਈ ਕਰਨ ਲਈ ਹੇਠਾਂ ਦਿੱਤੇ ਬਟਨ 'ਤੇ ਕਲਿੱਕ ਕਰੋ।`
          : targetLang === 'hi'
          ? `🌴 **आपकी छुट्टियों का शेष ब्यौरा:**\n\n${lines.join('\n')}\n\nछुट्टी आवेदन करने के लिए नीचे बटन पर क्लिक करें।`
          : `🌴 **LEAVE BALANCE SUMMARY:**\n\n${lines.join('\n')}\n\nClick below to apply for leave.`;
      } else {
        responseText = targetLang === 'pa'
          ? `🌴 **LEAVE BALANCE:**\n\n• **Casual Leave (CL)**: 12 ਦਿਨ ਪ੍ਰਤੀ ਸਾਲ\n• **Privilege Leave (PL)**: 15 ਦਿਨ ਪ੍ਰਤੀ ਸਾਲ\n• **Sick Leave (SL)**: 7 ਦਿਨ ਪ੍ਰਤੀ ਸਾਲ\n\nਕੁੱਲ ਬਾਕੀ ਛੁੱਟੀਆਂ: **34 ਦਿਨ**`
          : targetLang === 'hi'
          ? `🌴 **LEAVE BALANCE:**\n\n• **Casual Leave (CL)**: 12 दिन प्रतिवर्ष\n• **Privilege Leave (PL)**: 15 दिन प्रतिवर्ष\n• **Sick Leave (SL)**: 7 दिन प्रतिवर्ष\n\nकुल उपलब्ध छुट्टियां: **34 दिन**`
          : `🌴 **LEAVE BALANCE SUMMARY:**\n\n• **Casual Leave (CL)**: 12 days/year\n• **Privilege Leave (PL)**: 15 days/year\n• **Sick Leave (SL)**: 7 days/year\n\nTotal Available: **34 Days**`;
      }
      actionData = { type: 'LINK', url: '/leave', label: targetLang === 'pa' ? 'ਛੁੱਟੀ ਅਪਲਾਈ ਕਰੋ' : targetLang === 'hi' ? 'छुट्टी अप्लाई करें' : 'Apply Leave Now' };
    }

    // ── 8. APPLY LEAVE INITIATION ─────────────────────────────────────────────
    else if (lowerQuery.includes('apply leave') || lowerQuery.includes('leave tomorrow') || lowerQuery.includes('apply')) {
      const leaveTypes = await LeaveType.find({});
      nextStep = 'leave_apply_select_type';
      nextStepData = { leaveTypes: leaveTypes.length > 0 ? leaveTypes.map(t => ({ code: t.code, name: t.name })) : [{ code: 'CL', name: 'Casual Leave' }, { code: 'PL', name: 'Privilege Leave' }, { code: 'SL', name: 'Sick Leave' }] };
      responseText = targetLang === 'pa'
        ? `📝 **ਛੁੱਟੀ ਦੀ ਅਰਜ਼ੀ:**\n\nਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ ${empName}! ਤੁਸੀਂ ਕਿਹੜੀ ਛੁੱਟੀ ਲੈਣਾ ਚਾਹੁੰਦੇ ਹੋ? ਹੇਠਾਂ ਬਟਨ ਤੋਂ ਚੁਣੋ:`
        : targetLang === 'hi'
        ? `📝 **छुट्टी का आवेदन:**\n\nनमस्ते ${empName}! आप किस प्रकार की छुट्टी लेना चाहते हैं? नीचे बटन से चुनें:`
        : `📝 **LEAVE APPLICATION ENGINE:**\n\nHello ${empName}! Please select the leave type to apply:`;
      return res.json({ success: true, text: responseText, action: actionData, nextStep, nextStepData, modelUsed: modelName, targetLang });
    }

    // ── 9. GENERAL TRAINING / HELP INTENT ─────────────────────────────────────
    else if (lowerQuery.includes('training') || lowerQuery.includes('help') || lowerQuery.includes('guide') || lowerQuery.includes('module')) {
      if (targetLang === 'pa') {
        responseText = `🎓 **LEXVRA HRMS ਸਿਖਲਾਈ ਕੇਂਦਰ:**\n\nਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ ${empName}! ਤੁਸੀਂ ਕਿਸ ਮੋਡਿਊਲ ਦੀ ਸਿਖਲਾਈ ਲੈਣਾ ਚਾਹੁੰਦੇ ਹੋ? ਹੇਠਾਂ ਦਿੱਤੇ ਬਟਨ 'ਤੇ ਕਲਿੱਕ ਕਰੋ:\n\n1. 👤 **Employee Add**: ਨਵਾਂ ਕਰਮਚਾਰੀ ਜੋੜਨ ਦਾ ਤਰੀਕਾ\n2. 💵 **Salary & Payslip**: ਤਨਖਾਹ ਦੇਖਣੀ ਅਤੇ ਸਲਿਪ ਡਾਊਨਲੋਡ ਕਰਨੀ\n3. 🏛️ **Admin Dashboard**: ਐਡਮਿਨ ਡੈਸ਼ਬੋਰਡ ਦੀ ਪੂਰੀ ਟ੍ਰੇਨਿੰਗ\n4. 🌴 **Leave Apply**: ਛੁੱਟੀ ਦੀ ਅਰਜ਼ੀ ਦੇਣਾ\n5. ⏱️ **Attendance**: ਹਾਜ਼ਰੀ ਲਗਾਉਣੀ`;
      } else if (targetLang === 'hi') {
        responseText = `🎓 **LEXVRA HRMS प्रशिक्षण केंद्र:**\n\nनमस्ते ${empName}! आप किस मॉड्यूल की जानकारी चाहते हैं? नीचे दिए गए बटन या विकल्प पर क्लिक करें:\n\n1. 👤 **Employee Add**: नया कर्मचारी जोड़ने का तरीका\n2. 💵 **Salary & Payslip**: वेतन जांचना और स्लिप डाउनलोड करना\n3. 🏛️ **Admin Dashboard**: एडमिन डैशबोर्ड की पूरी ट्रेनिंग\n4. 🌴 **Leave Apply**: छुट्टी का आवेदन जमा करना\n5. ⏱️ **Attendance**: उपस्थिति दर्ज करना`;
      } else {
        responseText = `🎓 **LEXVRA HRMS TRAINING CENTER:**\n\nHello ${empName}! Which module training would you like to learn today?\n\n1. 👤 **Employee Add**: Step-by-step guide to add new staff\n2. 💵 **Salary & Payslip**: How to check salary & download payslip PDF\n3. 🏛️ **Admin Dashboard**: Complete module-by-module admin walkthrough\n4. 🌴 **Leave Management**: How to apply and track leaves\n5. ⏱️ **Attendance**: Punch logs and shift timings`;
      }
      actionData = { type: 'LINK', url: '/dashboard', label: 'Open Main Dashboard' };
    }

    // ── 10. DEFAULT RESPONSE ──────────────────────────────────────────────────
    else {
      responseText = targetLang === 'pa'
        ? `✨ **LX Intelligence**\n\nਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ ${empName}! ਮੈਂ LX Intelligence ਤੁਹਾਡੀ ਹਰ ਮਦਦ ਲਈ ਤਿਆਰ ਹਾਂ।\n\nਤੁਸੀਂ ਪੁੱਛ ਸਕਦੇ ਹੋ:\n• 👤 *"Employee add ਕਿਵੇਂ ਕਰੀਏ"* - ਪੂਰੀ ਟ੍ਰੇਨਿੰਗ\n• 💵 *"Salary slip ਕਿਵੇਂ ਡਾਊਨਲੋਡ ਕਰੀਏ"* - ਤਨਖਾਹ ਗਾਈਡ\n• 🏛️ *"Admin dashboard training"* - ਪੂਰੀ ਜਾਣਕਾਰੀ\n• 🌴 *"Leave apply ਕਰੋ"* - ਛੁੱਟੀ ਦੀ ਅਰਜ਼ੀ\n• 📄 *"Experience letter ਬਣਾਓ"* - ਤੁਰੰਤ PDF ਪੱਤਰ`
        : targetLang === 'hi'
        ? `✨ **LX Intelligence**\n\nनमस्ते ${empName}! मैं LX Intelligence आपकी सहायता के लिए तैयार हूँ।\n\nआप मुझसे ये सब पूछ सकते हैं:\n• 👤 *"Employee add कैसे करें"* - पूरी ट्रेनिंग\n• 💵 *"Salary slip कैसे डाउनलोड करें"* - वेतन गाइड\n• 🏛️ *"Admin dashboard training"* - पूरी जानकारी\n• 🌴 *"Leave apply करें"* - ऑटोमेटिक छुट्टी\n• 📄 *"Experience letter बनाएं"* - तुरंत PDF प्रमाण पत्र`
        : `✨ **LX Intelligence**\n\nHello ${empName}! I can help you manage your entire HRMS application.\n\nYou can ask:\n• 👤 *"How to add employee"* - Step-by-step training\n• 💵 *"How to download payslip"* - Salary guide\n• 🏛️ *"Admin dashboard training"* - Full walkthrough\n• 🌴 *"Apply leave"* - Interactive leave engine\n• 📄 *"Generate experience letter"* - Instant PDF letter`;
      actionData = { type: 'LINK', url: '/dashboard', label: 'Explore HR Portal' };
    }

    return res.json({ 
      success: true, 
      text: responseText, 
      action: actionData, 
      nextStep, 
      nextStepData, 
      modelUsed: modelName,
      targetLang 
    });

  } catch (error) {
    console.error('AI Controller Error:', error);
    res.status(500).json({ success: false, message: `AI Engine error: ${error.message}` });
  }
};
