@echo off
echo Testing API endpoints...
echo.

echo Testing /api/stores...
curl -s http://localhost:3000/api/stores
echo.
echo.

echo Testing /api/categories...
curl -s "http://localhost:3000/api/categories?status=active"
echo.
echo.

echo Testing /api/attributes...
curl -s "http://localhost:3000/api/attributes?status=active"
echo.
echo.

echo Done.
pause