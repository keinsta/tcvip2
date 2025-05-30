import upi_icon from "./pay_icon_UPI_logo.png";
import usdt_red_icon from "./pay_icon_usdt_red.svg";
import wallet_icon from "./pay_wallet_icon.svg";
import bank_icon from "./nank_icon.png";

export const images = [
  {
    id: "upi-apps",
    name: "UPI x APPS",
    image: upi_icon,
    alt: "upi_icon",
    bonus: 3, // Bonus moved to parent
    details: [
      {
        name: "UPIPAY x APPS",
        range: "100-50000",
        bonus: true,
        initialDepositAmount: ["100", "1k", "2k", "20k", "30k", "50k"],
      },
      {
        name: "GAAYPAY x APPS",
        range: "300-100000",
        initialDepositAmount: ["300", "3k", "5k", "20k", "50k", "100"],
      },
      {
        name: "GENTLEPAY x APPS",
        range: "100-20000",
        bonus: true,
        initialDepositAmount: ["100", "3k", "5k", "10k", "15", "20k"],
      },
      {
        name: "SUPERPAY x APPS",
        range: "100-50000",
        initialDepositAmount: ["100", "2k", "5k", "10k", "20k", "50k"],
      },
      {
        name: "WEPAY x APPS",
        range: "100-50000",
        initialDepositAmount: ["100", "500", "1k", "5k", "10k", "50k"],
      },
      {
        name: "BUDDY x APPS",
        range: "100-500",
        initialDepositAmount: ["100", "150", "200", "300", "400", "500"],
      },
      {
        name: "188PAY x APPS",
        range: "100-50000",
        initialDepositAmount: ["100", "2k", "5k", "10k", "20k", "50k"],
      },
      {
        name: "GREENPAY x APPS",
        range: "2000-50000",
        initialDepositAmount: ["2000", "3k", "5k", "10k", "20k", "50k"],
      },
      {
        name: "AIPAY x APPS",
        range: "100-20000",
        initialDepositAmount: ["100", "500", "1k", "5k", "10k", "20k"],
      },
      {
        name: "ZIPPAY x APPS",
        range: "100-50000",
        initialDepositAmount: ["100", "1k", "5k", "10k", "20k", "50k"],
      },
      {
        name: "HTPAY x APPS",
        range: "100-5000",
        initialDepositAmount: ["100", "500", "1k", "2k", "3k", "5k"],
      },
      {
        name: "7DAYS x APPS",
        range: "200-50000",
        initialDepositAmount: ["200", "2k", "5k", "10k", "20k", "50k"],
      },
      {
        name: "COLAPAY x APPS",
        range: "100-50000",
        initialDepositAmount: ["100", "1k", "5k", "10k", "20k", "50k"],
      },
      {
        name: "KUMARPAY x APPS",
        range: "100-20000",
        bonus: true,
        initialDepositAmount: ["100", "2k", "5k", "10k", "15k", "20k"],
      },
    ],
  },
  {
    id: "upi-qr",
    name: "UPI x QR",
    image: upi_icon,
    alt: "upi_icon_1",
    bonus: 3, // Bonus moved to parent
    details: [
      {
        name: "MAHAPAY x QR",
        range: "500-50000",
        bonus: true,
        initialDepositAmount: ["500", "2k", "5k", "10k", "20k", "50k"],
      },
      {
        name: "GAAYPAY x QR",
        range: "300-50000",
        initialDepositAmount: ["300", "3k", "5k", "10k", "50k", "100k"],
      },
      {
        name: "TTPAY x QR",
        range: "500-50000",
        bonus: true,
        initialDepositAmount: ["500", "2k", "5k", "10k", "20k", "50k"],
      },
      {
        name: "GREENPAY x QR",
        range: "2000-50000",
        initialDepositAmount: ["2000", "3k", "5k", "10k", "20k", "50k"],
      },
      {
        name: "AGPAY x QR",
        range: "300-50000",
        initialDepositAmount: ["300", "1k", "5k", "10k", "20k", "50k"],
      },
      {
        name: "YAYAPAY x QR",
        range: "200-50000",
        initialDepositAmount: ["200", "2k", "5k", "10k", "20k", "50k"],
      },
      {
        name: "CPUPAY x QR",
        range: "500-50000",
        initialDepositAmount: ["500", "1k", "5k", "10k", "20k", "50k"],
      },
    ],
  },
  {
    id: "usdt",
    name: "USDT",
    image: usdt_red_icon,
    alt: "usdt_red_icon",
    bonus: 5, // Bonus moved to parent
    details: [
      {
        name: "CASHPAY (TRC-20)",
        range: "10U-100000U",
        bonus: true,
        initialDepositAmount: ["10", "50", "100", "200", "500", "1000"],
      },
    ],
  },
  {
    id: "wallet",
    name: "Wallet",
    image: wallet_icon,
    alt: "wallet_icon",
    bonus: 3, // Bonus moved to parent
    details: [
      {
        name: "RPLINK",
        range: "1000-100000",
        bonus: true,
        initialDepositAmount: ["1000", "2k", "5k", "10k", "50k", "100k"],
      },
    ],
  },
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
