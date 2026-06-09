# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.






Now lets setup following doctor side apis, wherever it is used
1. get profile api: http://localhost:3000/api/doctors/profile
op data: {
    "success": true,
    "doctor": {
        "_id": "69a9bd6c90aa0f4c11fdf0c9",
        "name": "Shanvi Gupta",
        "email": "shanvi@gmail.com",
        "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjOUpYEb4Vm2qeuKKsBkcfkd886b_GtspcFQ&s",
        "dob": null,
        "gender": "Female",
        "phone": null,
        "address": {
            "line1": "123 Main St",
            "line2": "Apt 4B",
            "city": "Bangalore",
            "state": "Karnataka"
        },
        "about": "This is a default about section given by us",
        "specialization": "Gynecologist",
        "experience": "2",
        "fees": 500,
        "slots_booked": {
            "2026-06-02": [
                "10:30"
            ]
        },
        "earning": 0,
        "available": true,
        "createdAt": "2026-03-05T17:29:16.878Z"
    }
}   

2. now move to profile photo updattion like when doctor click on the profile doctor should see three option upload, remove and cancel as user do, now for upload craete a good interface for uploading image:

for uploading profile: post api: http://localhost:3000/api/doctors/upload-profile-picture
for removing profile : delete api: http://localhost:3000/api/doctors/remove-profile-picture

also in user side for removing profile there musst be call for get api but in backend it is delete api so fix it

o/p  : same as before

