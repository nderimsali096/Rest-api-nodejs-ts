export function checkDepositCoin(coin: number): boolean {
  return (
    coin === 5 || coin === 10 || coin === 20 || coin === 50 || coin === 100
  );
}
