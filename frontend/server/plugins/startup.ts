export default defineNitroPlugin((nitroApp) => {
  const port = process.env.PORT || 3000;
  console.log(`\n=========================================`);
  console.log(`✅ FRONTEND SERVICE STARTED ON PORT ${port}`);
  console.log(`=========================================\n`);
});
