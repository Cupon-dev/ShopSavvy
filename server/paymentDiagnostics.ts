import { storage } from './storage';

export async function diagnosePaymentIssue(userId: string) {
  console.log(`🔍 PAYMENT DIAGNOSIS for user ${userId}`);
  
  try {
    // 1. Check payment records
    const payments = await storage.getUserPayments(userId);
    console.log(`💳 Payment Records Found: ${payments.length}`);
    
    payments.forEach((payment, index) => {
      console.log(`  ${index + 1}. Payment ID: ${payment.paymentId}`);
      console.log(`     Product: ${payment.productId}`);
      console.log(`     Status: ${payment.status}`);
      console.log(`     Amount: ${payment.amount}`);
      console.log(`     Method: ${payment.paymentMethod}`);
      console.log(`     ---`);
    });

    // 2. Check library access
    const library = await storage.getUserLibrary(userId);
    console.log(`📚 Library Items Found: ${library.length}`);
    
    library.forEach((item, index) => {
      console.log(`  ${index + 1}. Product: ${item.productId} (${item.product?.name})`);
      console.log(`     Access: ${item.accessGranted}`);
      console.log(`     Date: ${item.purchaseDate}`);
      console.log(`     ---`);
    });

    // 3. Cross-reference payments with library access
    const paymentProductIds = payments.map(p => p.productId);
    const libraryProductIds = library.map(l => l.productId);
    
    const missingAccess = paymentProductIds.filter(pid => !libraryProductIds.includes(pid));
    
    console.log(`🔗 CROSS-REFERENCE ANALYSIS:`);
    console.log(`   Payments for products: [${paymentProductIds.join(', ')}]`);
    console.log(`   Library access for: [${libraryProductIds.join(', ')}]`);
    console.log(`   Missing library access: [${missingAccess.join(', ')}]`);

    return {
      userId,
      payments: payments.length,
      libraryItems: library.length,
      missingAccess: missingAccess.length,
      missingAccessProductIds: missingAccess,
      details: {
        paymentRecords: payments,
        libraryItems: library,
        discrepancies: missingAccess
      }
    };

  } catch (error) {
    console.error(`❌ Diagnosis failed for user ${userId}:`, error);
    throw error;
  }
}

export async function forceLibrarySync(userId: string) {
  console.log(`🔄 FORCE SYNC: Starting for user ${userId}`);
  
  const diagnosis = await diagnosePaymentIssue(userId);
  let syncResults = [];
  
  for (const payment of diagnosis.details.paymentRecords) {
    try {
      // Check if library access exists
      const hasAccess = await storage.hasAccess(userId, payment.productId);
      
      if (!hasAccess) {
        // Force grant access
        const libraryAccess = await storage.addToLibrary({
          userId,
          productId: payment.productId,
          accessGranted: true,
          purchaseDate: new Date()
        });
        
        console.log(`✅ FORCED ACCESS: Payment ${payment.paymentId} → Library ID ${libraryAccess.id}`);
        
        syncResults.push({
          paymentId: payment.paymentId,
          productId: payment.productId,
          status: 'access_granted',
          libraryId: libraryAccess.id
        });
      } else {
        syncResults.push({
          paymentId: payment.paymentId,
          productId: payment.productId,
          status: 'already_has_access'
        });
      }
    } catch (error) {
      console.error(`❌ Force sync failed for payment ${payment.paymentId}:`, error);
      syncResults.push({
        paymentId: payment.paymentId,
        productId: payment.productId,
        status: 'error',
        error: error.message
      });
    }
  }
  
  console.log(`🎉 FORCE SYNC COMPLETED: ${syncResults.filter(r => r.status === 'access_granted').length} access granted`);
  
  return {
    diagnosis,
    syncResults,
    newAccessGranted: syncResults.filter(r => r.status === 'access_granted').length
  };
}