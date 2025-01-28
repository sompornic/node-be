# github action and Argocd
### เริ่ม
 -  step การทำของเรา
    -   เราใช้ nodejs ในการทดสอบนะ เริ่มทำการสร้าง file server.js โดยทำ Restfull API อย่างง่าย ไว้เพื่อทดสอบ
    -   สร้าง Dockerfile 
    -   เตรียม github/workflows โดยสร้าง yml(yaml) ขึ้นมาโดยใช้ชื่อ docker-publish.yml ทำการ hub action จาก branch develop
        -   ส่วน step เรามี 1: Checkout code , 2: Login to Docker Hub , 3: Build Docker image , 4: Push Docker image 
            -   step 1: Checkout code ก็ไม่ได้มีอะไรพิเศษ เราอยู่ ที่ repo อยู่ล่ะ
            -   step 2: Login to Docker Hub ส่วนนี้เราก็ต้องมี docker hub  ตรงนี้จะให้เรากำหนด user pass โดย secrets ของ github วิธีทำก็ กด setting ที่ repo แล้วเลือก secrets and variables -> Actions คลิ๊กไป แล้วก็จะเลือกที่ new repository secret คลิ๊กไป -> จะเจอให้กรอก Name(var เอาไว้ไปใช้ใน workflows) , secret(เอาง่ายๆก็คือ value ของ var นั้น) หลังจากกรอกเสร็จก็ add ไปจ๊บ
            -   3: Build Docker image อันนี้เราก็จำเป็นต้องใช้ docker hub build ไปไว้ที่ path ที่เรามีสิทเข้าถึงน่ะ ก็คำสั่ง build ทั่วไป
            -   4: Push Docker image ก็แค่ push images ไปครับไว้ที่ path โดย path กำหนด นั้นๆจะไปอยู่บน dcoker hub ของเราครับ
    #### เย้ๆๆๆๆๆๆๆๆๆ เราเตรียม workflows เสร็จล่ะ
    ### ไปกันต่อส่วนที่เป็น Argo
    -   ติดตั้ง Argo CD บน Kubernetes
        -   kubectl create namespace argocd
        -   kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
        -   kubectl get pods -n argocd #get มาดูซะหน่อย
        -   kubectl port-forward svc/argocd-server -n argocd 8080:443 #ทำการ     port-forward ครับ และเปิดเบราว์เซอร์แล้วเข้าไปที่ https://localhost:8080
        -   เข้าสู่ระบบ:
            -   user : admin
            -   pass ต้องใช้ command : kubectl get secret argocd-initial-admin-secret -n argocd -o jsonpath="{.data.password}" | base64 -d #แนะนำถ้าใช้ windows ใช้ wsl ชีวิตจะสะดวกหน่อย
            -   เพิ่ม Repository ใน Argo CD ไปที่ Settings > Repositories > Connect Repo แล้วเลือก VIA HTTPS ต้องใส่ type เราใช้ git ใส่ Project หรือเลือก defualt ใส่ repo url ของแอพเรา ถ้าเป็น public ไม่ต้องใส่ user pass แต่ถ้า private ค้องใส่ ถ้าถูกต้องจะ Successfull
        #### จ๊บบไป step ถัดไป
        -   สร้าง path for deploy app
            -   ในที่นี้เราสร้าง folder dev ไว้โดยข้างในมี deployment and service แบบง่ายงับ สามารถอ่านดูได้เลย
        -   step ถัดมาทำการเขียนไฟล์ application.yaml ขึ้นมาเพื่อครั้งแรกเราจะใช้ kubectl apply ไปขึ้นไปครับ โดยที่ ในไฟล์นี้จะทำการไป deploy app เราให้โดยเราสามารถกำหนด NS ได้โดยอยู่ในส่่วน destination ครับ มันก็จะไปที่ repo ไปที่ branch ที่กำหนด แล้วเอาไป deploy ให้น่ะ ส่วนอื่นๆใน file มี comment อยู่ล่ะ ในที่นี้ใหทำการ fix images ไปก่อนนะจะได้ง่าย
    ### มามาต่อๆๆ ถ้าอยากทำให้ deploy แบบ auto ต้องใช้ argo images updater ช่วย
    -   let go
        -   ทำการ install : kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj-labs/argocd-image-updater/stable/manifests/install.yaml
        -   แล้วทำการสร้าง secret(git-cred) password ต้องทำเป็น private access token (PAT) \
        kubectl -n argocd-image-updater create secret generic git-creds --from-literal=username=someuser --from-literal=password=somepassword
        -   แล้วปรับแก้ในไฟล์ application.yaml โดยเพิ่ม : annotations:
        argocd-image-updater.argoproj.io/image-list \
        argocd-image-updater.argoproj.io/myapp.update-strategy : กำหนดรูปแบบการอัปเดต (update strategy) สำหรับ image ในแอป โดยมี 3 แบบ
            -   latest: อัปเดต image เป็น tag ล่าสุดเสมอ (อิงจาก latest tag)
            -   semver: ใช้การอัปเดตตาม semantic versioning (เช่น 1.2.0 → 1.3.0)
            -   name: อัปเดตโดยเปรียบเทียบตามลำดับชื่อของ image tag 

            argocd-image-updater.argoproj.io/write-back-method : หน้าที่: กำหนดวิธีที่ ArgoCD Image Updater จะอัปเดตข้อมูลกลับไปยัง repository หรือ manifest \
            -   git: อัปเดต image tag ในไฟล์ manifest ใน Git repository
            -   argocd: อัปเดต image โดยตรงในแอปพลิเคชัน ArgoCD (ใน UI ของ ArgoCD)
            -   none: ไม่ทำการเขียนกลับ (เหมาะสำหรับสถานการณ์ที่ต้องการการตรวจสอบก่อนเขียนจริง)
    ### ดูคัวอย่างได้จากในไฟล์ application.yaml ได้เลย