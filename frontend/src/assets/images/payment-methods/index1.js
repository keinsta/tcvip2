import upi_icon from "./pay_icon_UPI_logo.png";
import usdt_red_icon from "./pay_icon_usdt_red.svg";
import wallet_icon from "./pay_wallet_icon.svg";
import bank_icon from "./nank_icon.png";

export const images = [
  {
    id: "bank",
    name: "Banks",
    image: bank_icon,
    alt: "wallet_icon",
    bonus: 3, // Bonus moved to parent
    details: [
      {
        name: "Kotak Mahindra Bank",
        range: "10-100000",
        bonus: true,
        initialDepositAmount: ["10", "100", "500", "1k", "5k", "10k"],
      },
      {
        name: "IndusInd Bank",
        range: "10-100000",
        bonus: true,
        initialDepositAmount: ["10", "50", "100", "500", "1k", "5k"],
      },
    ],
  },
];
