import { prog } from "./program";

const main = async () => {
  await prog.parseAsync(process.argv);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
