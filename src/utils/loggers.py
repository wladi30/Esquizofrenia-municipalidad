import os
import logging
import traceback
import re

class Logger:
    def __init__(self):
        self.log_directory = "logsFiles/"
        os.makedirs(self.log_directory, exist_ok=True)  # Asegura que el directorio exista

    def __set_logger(self, log_type):
        log_filename = f"{log_type}.log"
        log_path = os.path.join(self.log_directory, log_filename)

        logger = logging.getLogger(log_filename)
        logger.setLevel(logging.DEBUG)

        file_handler = logging.FileHandler(log_path, encoding='utf-8')
        formatter = logging.Formatter(
            '%(asctime)s | %(threadName)s | %(processName)s | %(levelname)s | %(message)s',
            '%Y-%m-%d %H:%M:%S'
        )
        file_handler.setFormatter(formatter)

        if logger.hasHandlers():
            logger.handlers.clear()

        logger.addHandler(file_handler)
        return logger
    
    
    def sanitize_input(self,input_string):
    # Permitir solo caracteres alfanumericos, guiones y guiones bajos
        # return re.sub(r'[^a-zA-Z0-9_-]', '_', input_string)
        return re.sub(r'[^\w\s.,@|-]', '_', input_string)
    

    def add_to_log(self, level, message, log_type="general"):
        try:
            logger = self.__set_logger(log_type)
            message = self.sanitize_input(message)
            match level.lower():
                case 'critical':
                    logger.critical(message)
                case 'debug':
                    logger.debug(message)
                case 'error':
                    logger.error(message)
                case 'info':
                    logger.info(message)
                case 'warning':
                    logger.warning(message)
                case _:
                    logger.info(f"Undefined level: {level} | {message}")
        except Exception as e:
            pass


