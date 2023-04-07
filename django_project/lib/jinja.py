from jinja2 import Environment, DictLoader
# from jinja2 import Template
from dateutil.relativedelta import relativedelta
from datetime import datetime
from ipaddress import IPv4Address, IPv6Address

periods = {"YEAR": "years", "MONTH": "months", "DAY": "days", "HOUR": "hours", "MINUTE": "minutes", "SECOND": "seconds"}


class JinjaException(Exception):
    def __init__(self, message: str):
        self.message = message
        super().__init__("Jinja Error: {message}")


# =================================== STR =======================================
def filter_quote(text: str):
    """quote filter for jinja
    """
    return f"'{text}'"


def filter_rmquote(text: str):
    """rmquote filter for jinja
    """
    return text.replace("'", "")


def filter_substring(text: str, fr=0, to=None):
    """rmquote filter for jinja
    """
    text = str(text)
    to = to or len(text)
    return text[fr:to]


# =================================== IP =========================================
def filter_ipv4tostr(ipv4: int):
    """ipv4str filter for jinja
    """
    return str(IPv4Address(ipv4))


def filter_ipv4toip(ipv4: str):
    """ipv4int filter for jinja
    """
    return int(IPv4Address(ipv4))


def filter_ipv6tostr(ipv6: int):
    """ipv6str filter for jinja
    """
    return str(IPv6Address(ipv6))


def filter_ipv6toip(ipv6: str):
    """ipv6int filter for jinja
    """
    return int(IPv6Address(ipv6))


# =================================== DATETIME =====================================
def filter_date_format(dt: datetime, fmt=r"%Y-%m-%d"):
    """datetime_format filter for jinja
    """
    return dt.strftime(fmt)


def filter_date_add(dt: datetime, period="DAY", number=1, fmt=r"%Y-%m-%d"):
    """date_add filter for jinja
    """
    # dt = datetime.datetime.now() + datetime.timedelta(days=days)
    period = period if period in periods.keys() else "DAY"
    kwargs = {periods[period]: number}
    dt = datetime.now() + relativedelta(**kwargs)
    return dt.strftime(fmt)


def apply_jinja(text: str, **kwargs) -> str:
    """prepare text with Jinja
    """
    env = Environment(loader=DictLoader({'template': text}))
    env.filters["QUOTE"] = filter_quote
    env.filters["RMQUOTE"] = filter_rmquote
    env.filters["SUBSTRING"] = filter_substring
    env.filters["IPV4TOSTR"] = filter_ipv4tostr
    env.filters["IPV4TOIP"] = filter_ipv4toip
    env.filters["IPV6TOSTR"] = filter_ipv6tostr
    env.filters["IPV6TOIP"] = filter_ipv6toip
    env.filters["DATEFORMAT"] = filter_date_format
    env.filters["DATEADD"] = filter_date_add

    try:
        return env.get_template('template').render(trim_blocks=True, lstrip_blocks=True, **kwargs)
    except Exception as error:
        raise JinjaException(message=f'Jinga error: {error}') from error
