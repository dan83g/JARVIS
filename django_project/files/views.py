from django.http import HttpResponse, FileResponse, JsonResponse
# from django.http import StreamingHttpResponse

from django.contrib.auth.decorators import login_required

import io
import zipfile
import os
from datetime import datetime
import mimetypes


@login_required
def getFiles(request):
    if request.method == 'GET':
        files = request.GET.get('file', '').split(',')
    if request.method == 'POST':
        # возможно параметры передавались в теле сообщения
        if request.body:
            files = request.body.decode().split(',')
            # если пролошили и добавили индекс на диск D
            # for idx, val in enumerate(files):
            #     files[idx] = val.replace("d:","\\\\datasearch")
        else:
            files = request.POST.get('file', '').split(',')

    if len(files) > 0 and files[-1] == '':
        del files[-1]

    if len(files) == 1:
        filename = files[0]
        try:
            if os.path.exists(filename):
                response = FileResponse(open(filename, 'rb'))
                # 'inline;
                response['Content-Disposition'] = 'attachment; filename={filename}'.format(filename=os.path.basename(filename))
                return response
        except Exception:
            return JsonResponse({'status': 'error', 'message': 'Ошибка чтения файла'}, status=417)
    elif len(files) > 1:
        io_zip = io.BytesIO()
        # with zipfile.ZipFile(io_zip, 'w', zipfile.ZIP_DEFLATED) as ZIP:
        with zipfile.ZipFile(file=io_zip, mode='w', compression=zipfile.ZIP_STORED) as ZIP:
            for idx, filename in enumerate(files):
                # Ограничиваем количество файлов - 200
                if idx == 100:
                    break
                if os.path.exists(filename):
                    try:
                        ZIP.write(filename=filename, arcname=os.path.basename(filename))
                    except Exception:
                        pass

        # FileResponse работает только с binary data, ZipFile не умеет писть с mode='wb'
        response = HttpResponse(io_zip.getvalue(), content_type='application/zip')
        response['Content-Disposition'] = 'attachment; filename={filename}'.format(filename="files_archive_{:%d%m%Y_%H%M}.zip".format(datetime.now()))
        return response
    else:
        return JsonResponse({'status': 'error', 'message': 'Не предоставлены имена файлов'}, status=417)


class RangeFileWrapper(object):
    def __init__(self, filelike, blksize=8192, offset=0, length=None):
        self.filelike = filelike
        self.filelike.seek(offset, os.SEEK_SET)
        self.remaining = length
        self.blksize = blksize

    def close(self):
        if hasattr(self.filelike, 'close'):
            self.filelike.close()

    def __iter__(self):
        return self

    def __next__(self):
        if self.remaining is None:
            # If remaining is None, we're reading the entire file.
            data = self.filelike.read(self.blksize)
            if data:
                return data
            raise StopIteration()
        else:
            if self.remaining <= 0:
                raise StopIteration()
            data = self.filelike.read(min(self.remaining, self.blksize))
            if not data:
                raise StopIteration()
            self.remaining -= len(data)
            return data


# (r'^/mp4/(.*)$', 'mp4'),
def getMediaStream(request):
    if request.method == 'GET':
        filename = request.GET.get('file', None)
    if request.method == 'POST':
        filename = request.POST.get('file', None)
    if filename is not None:
        if os.path.exists(filename):
            content_type = mimetypes.guess_type(filename)
            content_type = content_type or 'application/octet-stream'
            size = os.path.getsize(filename)

            response = FileResponse(open(filename, 'rb'))
            response['Accept-Ranges'] = 'bytes'
            response['Content-Length'] = '{size}'.format(size=size)
            response['Content-Disposition'] = 'filename={filename}'.format(filename=os.path.basename(filename))
            return response
