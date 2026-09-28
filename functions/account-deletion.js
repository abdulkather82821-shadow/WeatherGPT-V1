const DELETE_COOLDOWN_MS = 15 * 60 * 1000;

function createDeleteOwnAccountData({ db, HttpsError, Timestamp, now = () => Date.now() }) {
  return async function deleteOwnAccountData(request) {
    if (!request?.auth || request.auth.token?.email_verified !== true) {
      throw new HttpsError("unauthenticated", "Sign in with a verified account to delete account data.");
    }
    if (!request.app) {
      throw new HttpsError("failed-precondition", "App Check verification is required.");
    }

    const uid = request.auth.uid;
    const rateLimitRef = db.doc(`accountDeletionRateLimits/${uid}`);
    await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(rateLimitRef);
      const lastAttemptAt = snapshot.data()?.lastAttemptAt;
      const lastAttempt = typeof lastAttemptAt?.toMillis === "function"
        ? lastAttemptAt.toMillis()
        : Number(lastAttemptAt);
      if (Number.isFinite(lastAttempt) && now() - lastAttempt < DELETE_COOLDOWN_MS) {
        throw new HttpsError("resource-exhausted", "Please wait before retrying account data deletion.");
      }
      transaction.set(rateLimitRef, { lastAttemptAt: Timestamp.fromMillis(now()) }, { merge: true });
    });

    try {
      await db.recursiveDelete(db.doc(`users/${uid}`));
      return { deleted: true };
    } catch (_) {
      throw new HttpsError("unavailable", "Account data could not be fully deleted. Please retry later.");
    }
  };
}

module.exports = { createDeleteOwnAccountData, DELETE_COOLDOWN_MS };
