import os
import subprocess
import pypdf

base_dir = os.path.abspath(".")
logo_img = "file://" + os.path.join(base_dir, "docs/woxsen_logo.png")
erd_img = "file://" + os.path.join(base_dir, "Presentation-II/ER-Diagram.png")
dash_img = "file://" + os.path.join(base_dir, "Presentation-III/screenshots/dashboard.png")
db_conn_img = "file://" + os.path.join(base_dir, "Presentation-III/screenshots/database-connected.png")
tickets_img = "file://" + os.path.join(base_dir, "Presentation-III/screenshots/tickets-view.png")
insert_form_img = "file://" + os.path.join(base_dir, "Presentation-III/screenshots/ticket-insert-form.png")
before_insert_img = "file://" + os.path.join(base_dir, "Presentation-III/screenshots/ticket-before-insert.png")
after_insert_img = "file://" + os.path.join(base_dir, "Presentation-III/screenshots/ticket-after-insert.png")
before_delete_img = "file://" + os.path.join(base_dir, "Presentation-III/screenshots/ticket-before-delete.png")
after_delete_img = "file://" + os.path.join(base_dir, "Presentation-III/screenshots/ticket-after-delete.png")
users_img = "file://" + os.path.join(base_dir, "Presentation-III/screenshots/users-view.png")
assets_img = "file://" + os.path.join(base_dir, "Presentation-III/screenshots/assets-view.png")
inspector_img = "file://" + os.path.join(base_dir, "Presentation-III/screenshots/dashboard-inspector.png")

print("Image paths configured successfully.")
