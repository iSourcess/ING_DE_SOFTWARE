# routes.py
from flask import render_template, redirect, url_for, flash
from flask_login import login_required, current_user
from models import Post, db
from datetime import datetime

@app.route('/dashboard')
@login_required
def dashboard():
    posts = Post.query.order_by(Post.post_date.desc()).all()
    return render_template('dashboard.html', posts=posts, current_user=current_user)

@app.route('/help')
@login_required
def help():
    return render_template('help.html')

@app.route('/contact')
@login_required
def contact():
    return render_template('contact.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))

@app.route('/post/<int:post_id>/edit', methods=['GET', 'POST'])
@login_required
def edit_post(post_id):
    post = Post.query.get_or_404(post_id)
    if post.author_id != current_user.id:
        flash('No tienes permiso para editar este post')
        return redirect(url_for('dashboard'))
    
    if request.method == 'POST':
        post.title = request.form['title']
        post.subtitle = request.form['subtitle']
        post.content = request.form['content']
        db.session.commit()
        flash('Post actualizado exitosamente')
        return redirect(url_for('dashboard'))
    
    return render_template('edit_post.html', post=post)

@app.route('/post/<int:post_id>/delete')
@login_required
def delete_post(post_id):
    post = Post.query.get_or_404(post_id)
    if post.author_id != current_user.id:
        flash('No tienes permiso para eliminar este post')
        return redirect(url_for('dashboard'))
    
    db.session.delete(post)
    db.session.commit()
    flash('Post eliminado exitosamente')
    return redirect(url_for('dashboard'))