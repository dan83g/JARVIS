import subprocess
import logging


def shell_exec(command):
    """Shell exec command.

    Args:
        command (str): cmd/ssh-command with args.

    Returns:
        Bool.

    """    
    process = subprocess.run(
        command,
        stderr=subprocess.PIPE,
        shell=True,
        universal_newlines=True
    )

    if process.returncode > 0:
        logging.exception(f"Error in executing of external process {process.stderr}")
        return False
    
    return True