## How to use

### Python Backend
Create a virtual environment to isolate our package dependencies locally (optional)
```
cd server
```
```
python3 -m venv env
source env/bin/activate  # On Windows use `env\Scripts\activate`
```
Install Python packages.
```
pip install -r requirements.txt
```

Run django's migrations
```
python3 manage.py migrate
```

Run server
```
python3 manage.py runserver localhost:8080
```

### Next.js Frontend

cd into the "src" directory and install the packages.
```
cd src
```

```
npm install
```

Create build
```
npm run build
```

Run build
```
npm run start
```

## Access

Now the application will be available on http://localhost:3000