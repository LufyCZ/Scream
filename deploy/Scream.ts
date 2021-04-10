import { Scream } from "../typechain";

export default async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const { address }: Scream = await deploy("Scream", {
    from: deployer,
  });

  console.log(`Scream deployed to ${address}`);
};
