/**
 * Indian Statutory Payroll Calculation Utility
 * Compliant with PF Act, ESI Act, PT (State Rules), Income Tax (New Slabs)
 */

const calculatePayroll = (basicSalary = 0, allowances = {}, customDeductions = {}, daysWorked = 30, totalDaysInMonth = 30) => {
  const prorationFactor = totalDaysInMonth > 0 ? daysWorked / totalDaysInMonth : 1;

  // Prorated Basic
  const earnedBasic = Math.round(basicSalary * prorationFactor);

  // Allowances Breakdown
  const hra = Math.round((allowances.hra || basicSalary * 0.5) * prorationFactor);
  const specialAllowance = Math.round((allowances.special || 5000) * prorationFactor);
  const da = Math.round((allowances.da || 0) * prorationFactor);
  const conveyance = Math.round((allowances.conveyance || 1600) * prorationFactor);
  const medical = Math.round((allowances.medical || 1250) * prorationFactor);
  const bonus = Math.round(allowances.bonus || 0);
  const incentives = Math.round(allowances.incentives || 0);

  const totalGrossSalary = earnedBasic + hra + specialAllowance + da + conveyance + medical + bonus + incentives;

  // PF Calculation: 12% of (Basic + DA) capped at basic threshold ₹15,000 pm if applicable
  const pfEligibleAmount = Math.min(earnedBasic + da, 15000);
  const employeePF = Math.round(pfEligibleAmount * 0.12);
  const employerPF = Math.round(pfEligibleAmount * 0.12);

  // ESI Calculation: Employee 0.75%, Employer 3.25% if gross <= ₹21,000 pm
  let employeeESI = 0;
  let employerESI = 0;
  if (totalGrossSalary <= 21000) {
    employeeESI = Math.round(totalGrossSalary * 0.0075);
    employerESI = Math.round(totalGrossSalary * 0.0325);
  }

  // Professional Tax (Standard Maharashtra/Karnataka slab benchmark)
  let professionalTax = 0;
  if (totalGrossSalary > 10000) {
    professionalTax = 200;
  } else if (totalGrossSalary > 7500) {
    professionalTax = 175;
  }

  // TDS / Income Tax (Estimated monthly calculation)
  const annualGross = totalGrossSalary * 12;
  let annualTDS = 0;
  if (annualGross > 1200000) {
    annualTDS = (annualGross - 1200000) * 0.20 + 90000;
  } else if (annualGross > 900000) {
    annualTDS = (annualGross - 900000) * 0.15 + 45000;
  } else if (annualGross > 600000) {
    annualTDS = (annualGross - 600000) * 0.10 + 15000;
  } else if (annualGross > 300000) {
    annualTDS = (annualGross - 300000) * 0.05;
  }
  const monthlyTDS = Math.round(annualTDS / 12);

  // Additional custom deductions
  const loanRecovery = Math.round(customDeductions.loanRecovery || 0);
  const advanceRecovery = Math.round(customDeductions.advanceRecovery || 0);
  const lopDeduction = Math.round((totalDaysInMonth - daysWorked) * (totalGrossSalary / totalDaysInMonth));

  const totalDeductions = employeePF + employeeESI + professionalTax + monthlyTDS + loanRecovery + advanceRecovery;
  const netSalary = Math.max(0, totalGrossSalary - totalDeductions);

  return {
    earnedBasic,
    allowances: {
      hra,
      specialAllowance,
      da,
      conveyance,
      medical,
      bonus,
      incentives
    },
    grossSalary: totalGrossSalary,
    statutoryDeductions: {
      pf: employeePF,
      esi: employeeESI,
      professionalTax,
      tds: monthlyTDS
    },
    employerContributions: {
      pf: employerPF,
      esi: employerESI
    },
    otherDeductions: {
      loanRecovery,
      advanceRecovery,
      lopDeduction
    },
    totalDeductions,
    netSalary
  };
};

module.exports = { calculatePayroll };
