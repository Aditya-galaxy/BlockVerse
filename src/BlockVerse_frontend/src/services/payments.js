export const paymentService = {
  convertICPToE8s(icp) {
    return Math.floor(icp * 100000000);
  },

  convertE8sToICP(e8s) {
    return e8s / 100000000;
  },

  formatICP(amount, decimals = 8) {
    return amount.toFixed(decimals).replace(/\.?0+$/, '');
  },

  async sendTip(actor, recipientId, amountICP) {
    const amountE8s = this.convertICPToE8s(amountICP);
    return await actor.tip_user(recipientId, amountE8s);
  },

  async getBalance(actor, userId) {
    const balanceE8s = await actor.get_user_balance(userId);
    return this.convertE8sToICP(balanceE8s);
  }
};