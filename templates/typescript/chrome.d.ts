// A temporary solution to ignore TypeScript errors
declare var chrome: {
  runtime: any;
  panel: any;
  devtools: any;
  storage: any;
  tabs: any;
};
