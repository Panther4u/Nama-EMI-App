const Device = require('./models/Device');

async function checkOverduePayments() {
    console.log('[Scheduler] Checking for overdue payments...');

    // Find active devices with past due dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
        const overdueDevices = await Device.find({
            isLocked: false,
            'emiDetails.nextDueDate': { $lt: today },
            $expr: { $lt: ["$emiDetails.paidEmis", "$emiDetails.tenure"] } // Still has EMIs left
        });

        if (overdueDevices.length > 0) {
            console.log(`[Scheduler] Found ${overdueDevices.length} overdue devices. Locking now...`);

            for (const device of overdueDevices) {
                device.isLocked = true;
                // Apply full restrictions
                device.featureLocks = {
                    camera: true,
                    network: true,
                    wifi: true,
                    powerOff: true,
                    reset: true
                };
                await device.save();
                console.log(`[Scheduler] Auto-locked device: ${device.customerName} (${device.id}) due to overdue payment.`);
            }
        } else {
            console.log('[Scheduler] No overdue devices found.');
        }
    } catch (err) {
        console.error('[Scheduler] Error checking overdue payments:', err);
    }
}

module.exports = { checkOverduePayments };
