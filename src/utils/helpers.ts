export function checkDepositCoin(coin: number): boolean {
  return (
    coin === 5 || coin === 10 || coin === 20 || coin === 50 || coin === 100
  );
}

export function getChange(depositState: number): number[] {
  const result: number[] = [];
  while (depositState >= 100) {
    const numberOf100 = Math.floor(depositState / 100);
    let counter = 0;
    while (counter < numberOf100) {
      result.push(100);
      depositState -= 100;
      counter++;
    }
    break;
  }
  while (depositState >= 50) {
    const numberOf50 = Math.floor(depositState / 50);
    let counter = 0;
    while (counter < numberOf50) {
      result.push(50);
      depositState -= 50;
      counter++;
    }
    break;
  }
  while (depositState >= 20) {
    const numberOf20 = Math.floor(depositState / 20);
    let counter = 0;
    while (counter < numberOf20) {
      result.push(20);
      depositState -= 20;
      counter++;
    }
    break;
  }
  while (depositState >= 10) {
    const numberOf10 = Math.floor(depositState / 10);
    let counter = 0;
    while (counter < numberOf10) {
      result.push(10);
      depositState -= 10;
      counter++;
    }
    break;
  }
  while (depositState >= 5) {
    const numberOf5 = Math.floor(depositState / 5);
    let counter = 0;
    while (counter < numberOf5) {
      result.push(5);
      depositState -= 5;
      counter++;
    }
    break;
  }
  return result;
}
