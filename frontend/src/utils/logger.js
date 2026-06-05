const IS_DEV = import.meta.env.DEV;

const logger = {
  error: (context, error) => {
    if (IS_DEV) {
      console.error(`[${context}]`, error);
    }
  },
  warn: (context, message) => {
    if (IS_DEV) {
      console.warn(`[${context}]`, message);
    }
  },
  info: (context, message) => {
    if (IS_DEV) {
      console.info(`[${context}]`, message);
    }
  },
};

export default logger;
