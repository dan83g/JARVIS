from abc import ABC, abstractmethod
from dataclasses import dataclass
import sys
import traceback
import json
from jsonpath_ng import parse
from lxml import etree
from lib.enum import FactoryEnum


class ParserException(Exception):
    pass


@dataclass
class ParserAbstractFactory(ABC):
    """ Abstract Factory Class for parsers
    """
    text: str
    code: str

    @abstractmethod
    def execute(self) -> list[dict]:
        pass


@dataclass
class TextParser(ParserAbstractFactory):
    """Text parser
    """
    def execute(self) -> list[dict]:
        return [{"text": self.text}]


@dataclass
class XMLParser(ParserAbstractFactory):
    """xml text parser with XPath
    """
    def execute(self) -> list[dict]:
        result = []
        try:
            tree = etree.fromstring(self.text)  # type: ignore
            for item in tree.xpath(self.code):
                if isinstance(item, (str, int, bool, float)):
                    result.append({"attribute": item})
                else:
                    result.append(self._xml_node_to_dict(item))
        except Exception as error:
            raise ParserException(f'Error in parsing xml-data: {error}')
        return result

    def _xml_node_to_dict(self, node) -> dict:
        if node.getchildren() == []:
            return {node.tag: node.text}

        result = {}
        for element in node.iterchildren():
            # Remove namespace prefix
            key = element.tag.split('}')[1] if '}' in element.tag else element.tag
            # Process element as tree element if the inner XML contains non-whitespace content
            value = element.text if element.text and element.text.strip() else self._xml_node_to_dict(element)
            if key in result:
                if type(result[key]) is list:
                    result[key].append(value)
                else:
                    tempvalue = result[key].copy()
                    result[key] = [tempvalue, value]
            else:
                result[key] = value
        return result


@dataclass
class JsonParser(ParserAbstractFactory):
    """json text parser with JsonPath
    """
    def execute(self) -> list[dict]:
        result = []
        try:
            oJson = json.loads(self.text)
            jsonpath_expression = parse(self.code)
            matches = jsonpath_expression.find(oJson)
            for match in matches:
                if isinstance(match.value, dict):
                    result.append(match.value)
                elif match.path.fields and match.path.fields[0]:
                    if result and isinstance(result[-1], dict) and match.path.fields[0] not in result[-1].keys():
                        result[-1][match.path.fields[0]] = match.value
                    else:
                        result.append({match.path.fields[0]: match.value})
        except Exception as error:
            raise ParserException(f'Error in parsing json-data: {error}')
        return result


@dataclass
class PythonParser(ParserAbstractFactory):
    """python text parser
    """
    def execute(self) -> list[dict]:
        try:
            locals = {'results': [], 'text': self.text}
            exec(self.code, locals)
        except SyntaxError as error:
            raise ParserException(f'{error.__class__.__name__} at line {error.lineno}: {error.args[0]}')
        except Exception as error:
            _, _, _traceback = sys.exc_info()
            line_number = traceback.extract_tb(_traceback)[-1][1]
            raise ParserException(f'{error.__class__.__name__} at line {line_number}: {error.args[0]}')
        else:
            if (not locals['results']
                    or not isinstance(locals['results'], list)
                    or not any(isinstance(row_obj, dict) for row_obj in locals['results'])):
                raise ParserException('Output data is not equel to List[dict]')
            return locals['results']


class ParserType(FactoryEnum):
    TEXT = TextParser
    XML = XMLParser
    JSON = JsonParser
    PYTHON = PythonParser


@dataclass
class Parser:
    """Parser class
    """
    text: str
    code: str
    parser: ParserType | str | None = ParserType.TEXT

    def __post_init__(self) -> None:
        if isinstance(self.parser, (str, type(None))):
            self.parser = ParserType(ParserType.get_member(self.parser)) or ParserType.TEXT

    def _create_factory(self, parser: ParserType) -> ParserAbstractFactory:
        return parser.factory(text=self.text, code=self.code)

    def execute(self) -> list[dict]:
        """execute parser
        """
        factory = self._create_factory(parser=self.parser)  # type: ignore
        return factory.execute()
