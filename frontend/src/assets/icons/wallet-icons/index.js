import walletIcon from "./wallets.png";
import deposit from "./deposit.png";
import withdraw from "./withdraw.png";
import depositHistory from "./rechargeHistory.png";
import withdrawHistory from "./withdrawHistory.png";
import bet from "./bet.png";
import transaction from "./transaction.png";

export const icons = [
  { icon: walletIcon, title: "Wallet Icon" },
  { icon: deposit, title: "Deposit", link_to: "/deposit" },
  { icon: withdraw, title: "Withdraw", link_to: "/withdraw" },
  {
    icon: depositHistory,
    title: "Deposit History",
    link_to: "/deposit-history",
  },
  {
    icon: withdrawHistory,
    title: "Withdraw History",
    link_to: "/withdraw-history",
  },
];

export const history_icons = [
  {
    icon: bet,
    title: "Bet",
    subTitle: "My Betting History",
    link_to: "/bet-history",
  },
  {
    icon: transaction,
    title: "Transaction",
    subTitle: "My Transaction History",
    link_to: "/transaction-history",
  },
  {
    icon: depositHistory,
    title: "Deposit",
    subTitle: "My Deposit History",
    link_to: "/deposit-history",
  },
  {
    icon: withdrawHistory,
    title: "Withdraw",
    subTitle: "My Withdraw History",
    link_to: "/withdraw-history",
  },
];
